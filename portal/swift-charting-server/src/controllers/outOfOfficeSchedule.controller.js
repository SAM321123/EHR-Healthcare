const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const { appointmentStatus } = require('../config/appointment');
const { appointmentCancelQueue } = require('../services/emailqueue');

const createOutOfOfficeSchedule = catchAsync(async (req, res) => {
    const { clinicUuid: uuid } = req || {};
    const {
        locationId,
        staffId,
        startDateTime,
        endDateTime,
    } = req.body || {};

    const db = getModels(uuid);
    const existingOooSchedule = await dbService.getOne({
        model: db.OutOfOfficeSchedule,
        filter: { where: { staffId, locationId, startDateTime, endDateTime, isDeleted: false } },
    });

    if (existingOooSchedule) {
        throw new Error('Schedule already exists !');
    }
    const oooSchedule = await db.OutOfOfficeSchedule.create({
        locationId,
        staffId,
        startDateTime,
        endDateTime,
    });
    const appointments = await db.Appointment.findAll({
        where: {
            practitionerId: staffId,
            locationId,
            isDeleted: false,
            startDateTime: { [Op.lt]: endDateTime },
            endDateTime: { [Op.gt]: startDateTime },
        },
        include: [{
            model: db.Patient, as: 'patients', attributes: ['email'],
        }]
    });

    const appointmentIds = appointments.map(appointment => appointment.id);

    if (appointmentIds.length) {
        await db.Appointment.update(
            { statusCode: appointmentStatus.CANCELED },
            {
                where: {
                    id: appointmentIds,
                    statusCode: appointmentStatus.CONFIRMED
                }
            }
        );

        // ======================================
        // EXTRACT PATIENT EMAILS FROM APPOINTMENTS
        // ======================================
        const patientEmails = [];
        appointments.forEach((appointment) => {
            if (appointment.patients && Array.isArray(appointment.patients)) {
                appointment.patients.forEach((patient) => {
                    if (patient.dataValues && patient.dataValues.email) {
                        patientEmails.push({
                            email: patient.dataValues.email,
                        });
                    }
                });
            }
        });

        // ======================================
        // CREATE EMAIL AUDIT RECORDS
        // ======================================
        if (patientEmails.length > 0) {
            try {
                const records = await db.EmailAudit.bulkCreate(
                    patientEmails.map((patient) => ({
                        email: patient.email,
                        subject: 'Appointment Canceled - Staff Out of Office',
                        status: 'PENDING',
                    })),
                    { returning: true }
                );

                // ======================================
                // PUSH TO QUEUE
                // ======================================
                const jobs = await appointmentCancelQueue.addBulk(
                    records.map((record, index) => ({
                        name: 'send-appointment-cancel',
                        data: {
                            auditId: record.id,
                            email: patientEmails[index].email,
                            clinicUuid: req.clinicUuid,
                        },
                    }))
                );

                console.log('Cancellation emails queued successfully:', jobs);
            } catch (err) {
                console.error('Email Queue Error:', err);
            }
        }
    }
    res.status(httpStatus.CREATED).send(oooSchedule);
});

const getOooSchedule = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const result = await dbService.getPaginated({
        model: db.OutOfOfficeSchedule,
        req,
        allowedFilters: ['staffId'],
        include: [{ model: db.PracticeLocation, as: 'location' }]
    });
    res.status(httpStatus.OK).send(result);
});

const getOooSchedulesForSlotCheck = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const { startDate, endDate, staffId, locationId } = req.query;

    // Build filter object
    let filter = {
        isDeleted: false,
    };

    // Filter by date range if provided
    if (startDate && endDate) {
        filter.startDateTime = {
            [Op.lt]: new Date(`${endDate}T23:59:59.999Z`),
        };
        filter.endDateTime = {
            [Op.gt]: new Date(`${startDate}T00:00:00.000Z`),
        };
    } else if (startDate) {
        filter.startDateTime = {
            [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
        };
    } else if (endDate) {
        filter.endDateTime = {
            [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
        };
    }

    // Filter by staffId if provided
    if (staffId) {
        filter.staffId = staffId;
    }

    // Filter by locationId if provided
    if (locationId) {
        filter.locationId = locationId;
    }

    const result = await dbService.getAll({
        model: db.OutOfOfficeSchedule,
        filter: { where: filter },
        include: [{ model: db.PracticeLocation, as: 'location' }]
    });
    
    res.status(httpStatus.OK).send(result);
});

const updateOooSchedule = catchAsync(async (req, res) => {
    const { body = {}, user, params, clinicUuid: uuid } = req;
    const { id } = params || {};
    const { id: userId } = user;
    const db = getModels(uuid);
    const existingOooSchedule = await dbService.getOne({ model: db.OutOfOfficeSchedule, filter: { where: { id, isDeleted: false } } });

    if (!existingOooSchedule) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
    }
    const updateParams = { id, ...body, updatedById: userId };
    if (body.isDeleted) {
        updateParams.isDeletedById = user.id;
    }
    const updatedOooSchedule = await dbService.updateById({ model: db.OutOfOfficeSchedule, reqParams: { ...updateParams } });
    res.status(httpStatus.OK).send(updatedOooSchedule);
});

module.exports = {
    createOutOfOfficeSchedule,
    getOooSchedule,
    getOooSchedulesForSlotCheck,
    updateOooSchedule,
};
