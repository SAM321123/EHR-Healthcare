/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');


const getPaitentMedicationHistory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getPaginated({
    model: db.PatientMedicationHistory,
    req,
    allowedFilters: ['patientId','patientMedicationId'],
    searchFilter: [],
    include: [
      { model: db.GlobalType, as: 'dose' },
      { model: db.GlobalType, as: 'unit' },
      { model: db.GlobalType, as: 'route' },
      { model: db.GlobalType, as: 'frequency' },
      { model: db.GlobalType, as: 'duration' },
      { model: db.GlobalType, as: 'medicationStatus' },
      { model: db.GlobalType, as: 'direction' },
      { model: db.DiagnosisIcd, as: 'rxReason'},
      { model: db.Diagnosis, as: 'patientDiagnosis'},
      { model: db.Staff, as: 'prescriber' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});





module.exports = {
  getPaitentMedicationHistory,
};
