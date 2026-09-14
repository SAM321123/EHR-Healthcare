const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createEncounterNote = catchAsync(async (req, res) => {
  const { user, body } = req;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientId, encounterId, noteType = 'note' } = body || {};
  const userId = user.id;

  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const encounter = await dbService.getOneById({
    model: db.PatientEncounters,
    id: encounterId,
  });
  if (!encounter) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Encounter'));
  }

  if (encounter.patientId !== patientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Encounter does not belong to this patient.');
  }

  if (noteType === 'addendum' && (encounter.atDraft || !encounter.signature?.trim())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Addendum is available only for saved and signed encounters.');
  }

  const encounterNote = await dbService.createOne({
    model: db.EncounterNote,
    reqParams: { ...body, noteType, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(encounterNote);
});


module.exports = {
  createEncounterNote,
};
