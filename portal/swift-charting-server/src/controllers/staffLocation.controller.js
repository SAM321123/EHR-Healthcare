const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { getModels } = require('../utils/connection');
const { dbService, emailService, userService } = require('../services');
const { roles } = require('../config/roles');
const randomPassword = require('../utils/randomPassword');
const { isUserExist } = require('../services/user.service');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { isEmpty } = require('lodash');

const getLocation = catchAsync(async (req, res) => {
  const { clinicUuid: uuid, } = req || {};
  const {isActiveSchedule} = req.query;
  const db = getModels(uuid);
  const location = await dbService.getPaginated({
    model: db.StaffLocation,
    req,
    allowedFilters: ['staffId'],
    include: [{ model: db.PracticeLocation, as: 'location' },
      { model: db.CalendarSchedule, as: 'calenderSchedule', ...(isActiveSchedule !== undefined && { where: { isActive: isActiveSchedule },required: false }) }],
  });
  res.status(httpStatus.OK).send(location);
});

const getLocationById = catchAsync(async (req, res) => {
  const {  clinicUuid: uuid } = req;
  const db = getModels(uuid);
  const location = await dbService.getPaginated({
    model: db.StaffLocation,
    req,
    allowedFilters: ['staffId'],
    // include: [{ model: db.PracticeLocation, as: 'location' }],
  });
  res.status(httpStatus.OK).send(location);
})

const createLocation = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const {
    locationId,
    staffId,
    schedule,
    leadDays,
    appointmentConfirmation,
    appointmentInterval,
    leadInterval,
    preferredScheduleCode,
    hidePricesForOnlineAppointments,
    hideDurationsForOnlineAppointments,
    showPractitionerSelector,
    howFarInFuture,
    sendAppointmentConfirmationThroughTextAlso,
    paymentForBooking,
    depositAmount,
    textTemplateForPatientConfirmation,
    gapInDays,
  } = req.body || {};

  const db = getModels(uuid);
  const existingLocation = await dbService.getOne({
    model: db.StaffLocation,
    filter: { where: { staffId, locationId, isDeleted: false } },
  });

  if (existingLocation) {
    throw new Error('Location already exists !');
  }
  if(leadDays.includes('0_day') && !leadInterval){
    throw new Error('Fill lead interval !');
  }
  if (paymentForBooking === 'deposit_required_cancellation_fee' && (!depositAmount || Number(depositAmount) <= 0)) {
    throw new Error('Deposit amount is required when a cancellation fee/deposit is configured.');
  }
  const location = await db.StaffLocation.create({
    locationId,
    staffId,
    schedule,
    leadDays,
    appointmentConfirmation,
    appointmentInterval,
    leadInterval: leadDays.includes('0_day') ? leadInterval : null,
    preferredScheduleCode,
    hidePricesForOnlineAppointments: hidePricesForOnlineAppointments || false,
    hideDurationsForOnlineAppointments: hideDurationsForOnlineAppointments || false,
    showPractitionerSelector: showPractitionerSelector || 'yes',
    howFarInFuture: howFarInFuture || '12_months',
    sendAppointmentConfirmationThroughTextAlso: sendAppointmentConfirmationThroughTextAlso || 'to_both',
    paymentForBooking: paymentForBooking || 'not_required',
    depositAmount: depositAmount || 0,
    textTemplateForPatientConfirmation: textTemplateForPatientConfirmation != null ? String(textTemplateForPatientConfirmation) : 'default_reminder_text',
    gapInDays: gapInDays !== undefined ? gapInDays : 2,
  });
  res.status(httpStatus.CREATED).send(location);
});

const updateLocation = catchAsync(async (req, res) => {
  const { body = {}, user, params, clinicUuid: uuid } = req;
  const { id } = params || {};
  const { id: userId } = user;
  const db = getModels(uuid);
  const existingLocation = await dbService.getOne({ model: db.StaffLocation, filter: { where: { id, isDeleted: false } } });

  if (!existingLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }
  const updateParams = { id, ...body, updatedById: userId };
  if (body.isDeleted) {
    updateParams.isDeletedById = user.id;
  }
  if (body.textTemplateForPatientConfirmation != null) {
    updateParams.textTemplateForPatientConfirmation = String(body.textTemplateForPatientConfirmation);
  }
  if (body.leadDays && !body.leadDays.includes('0_day')) {
    updateParams.leadInterval = null;
  }
  if (body.leadDays && body.leadDays.includes('0_day') && !body.leadInterval) {
    throw new Error('Fill lead interval !');
  }
  if (body.paymentForBooking === 'deposit_required_cancellation_fee' && (!body.depositAmount || Number(body.depositAmount) <= 0)) {
    throw new Error('Deposit amount is required when a cancellation fee/deposit is configured.');
  }
  const updatedLocation = await dbService.updateById({ model: db.StaffLocation, reqParams: { ...updateParams } });
  res.status(httpStatus.OK).send(updatedLocation);
});
const setPrimaryLocation = catchAsync(async (req, res) => {
  const { body = {}, user, params, clinicUuid: uuid } = req;
  const { id } = params || {};
  const { id: userId } = user;
  const { staffId, ...rest } = body;
  const db = getModels(uuid);
  const existingLocation = await dbService.getOne({ model: db.StaffLocation, filter: { where: { id, isDeleted: false } } });

  if (!existingLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }
  if (rest.isPrimaryLocation) {
    const allIsPrimaryLocation = await dbService.getAll({
      model: db.StaffLocation,
      filter: { where: { staffId, isPrimaryLocation: true } },
    });
    if (allIsPrimaryLocation && allIsPrimaryLocation.length) {
      for (const primaryLocation of allIsPrimaryLocation) {
        await dbService.updateOne({
          model: db.StaffLocation,
          filter: { where: { staffId } },
          updateParams: { id: primaryLocation.id, isPrimaryLocation: false, updatedById: userId },
        });
      }
    }
  }
  const updateParams = { id, ...rest, updatedById: userId };

  const updatedLocation = await dbService.updateById({ model: db.StaffLocation, reqParams: { ...updateParams } });
  res.status(httpStatus.OK).send(updatedLocation);
});

module.exports = {
  getLocation,
  createLocation,
  updateLocation,
  setPrimaryLocation,
  getLocationById,
};
