/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService  } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const getMARData = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const {subscribeSocket} = req.query || {};
    const { patientId } = req.query;
    let filter = {
        // isDeleted: false,
        patientId,
      };
    
    // const { listView, startDate, endDate, practitionerId, statusCode, locationId, patientId, typeCode } = req.query;
  
    // if (startDate && endDate) {
    //   filter.startDateTime = {
    //     [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    //   };
    // } else if (startDate) {
    //   filter.startDateTime = {
    //     [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    //   };
    // } else if (endDate) {
    //   filter.startDateTime = {
    //     [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    //   };
    // }
  
    const includeOptions = [
        { model: db.PatientMedicationItems, as: 'medicineItem' },
    //   { model: db.PracticeLocation, as: 'location' },
    //   { model: db.Staff, as: 'practitioner', include: [{ model: db.GlobalType, as: 'title' }] },
    //   { model: db.GlobalType, as: 'status' },
    //   { model: db.GlobalType, as: 'copay' },
    //   { model: db.GlobalType, as: 'type' },
    //   { model: db.Patient, as: 'patients', include: [{ model: db.GlobalType, as: 'title' },{ model: db.GlobalType, as: 'genderIdentity' },{ model: db.GlobalType, as: 'sexAtBirth' },{ model: db.File, as: 'file' }] },
    //   { model: db.PatientForm, as: 'patientForms' },
    //   { model: db.RecurringSetting, as: 'recurringSetting' },
    //   {
    //     model: db.DiagnosisProblem,
    //     as: 'problem',
    //   },
    ];
  
      const whereClause = { where: {} };
      whereClause.where = filter;
    //   if (practitionerId) {
    //     whereClause.where.practitionerId = practitionerId;
    //   }
    //   if (statusCode) {
    //     whereClause.where.statusCode = {
    //       [Op.in]: statusCode,
    //     };
    //   }
    //   if (locationId) {
    //     whereClause.where.locationId = {
    //       [Op.in]: locationId,
    //     };
    //   }
    //   if (typeCode) {
    //     whereClause.where.typeCode = {
    //       [Op.in]: typeCode,
    //     };
    //   }
      data = await dbService.getAll({
        model: db.MedicationSchedule,
        filter: whereClause,
        otherOptions: { include: includeOptions },
        subscribeSocket,
        tenantId:uuid,
      });
      result = data;
    res.status(httpStatus.OK).send(result);
  });
  

module.exports = {
  getMARData
};
