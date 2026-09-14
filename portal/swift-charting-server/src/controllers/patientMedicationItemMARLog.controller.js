const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { getStartOfTheDayWithTZ, getEndOfTheDayWithTZ } = require('../utils/dateUtility');


const createPatientMedicationItemMARLog = catchAsync(async (req, res) => {
    const { clinicUuid: uuid,body } = req || {};
    const db = getModels(uuid);
    const patientMedicationItemMARLog = await db.PatientMedicationItemMARLog.create({...body});
    res.status(httpStatus.CREATED).send(patientMedicationItemMARLog);
  });

const getPatientMedicationItemMARLogs = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { startDate, endDate,timezone} = req.query;
const filter ={};
  if (startDate && endDate && timezone) {
    filter.date = {
      [Op.between]: [getStartOfTheDayWithTZ(startDate,{timezone}), getEndOfTheDayWithTZ(endDate,{timezone})],
    };
  } else if (startDate) {
    filter.date = {
      [Op.gte]: getStartOfTheDayWithTZ(startDate,{timezone}),
    };
  } else if (endDate) {
    filter.date = {
      [Op.lte]: getEndOfTheDayWithTZ(endDate,{timezone}),
    };
  }


  const result = await dbService.getPaginated({
    model: db.PatientMedicationItemMARLog,
    req,
    allowedFilters: [],
    searchFilter: [],
    addOnFilter: filter,
    include:[{model:db.GlobalType,as:'action'}]
  });
  res.status(httpStatus.OK).send(result);
});

const updatePatientMedicationItemMARLog = catchAsync(async (req, res) => {
  const { user, params, body } = req || {};
  const userId = user.id;

  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { marId, ...rest } = body || {};
  let update;
  const {patientMARId} = params;
  const existingItemMarLog = await dbService.getOneById({ 
    model: db.PatientMedicationItemMARLog,
    id: patientMARId,
  });

  if (!existingItemMarLog) {
    throw new ApiError(httpStatus.NOT_FOUND,errorMessages.NO_RECORD_FOUND);
  }
  
  const [, [updatedMarLog]] = await dbService.updateOne({
    model: db.PatientMedicationItemMARLog,
    updateParams: body,
    filter: { where: { id: patientMARId } },
  });
  res.status(httpStatus.OK).send(updatedMarLog);

});



module.exports = {
  getPatientMedicationItemMARLogs,
  createPatientMedicationItemMARLog,
  updatePatientMedicationItemMARLog,
};
