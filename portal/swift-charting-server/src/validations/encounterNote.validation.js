const Joi = require('joi');

const ENCOUNTER_NOTE_MAX_LENGTH = 10000;
const ENCOUNTER_NOTE_TYPES = ['note', 'addendum'];

const createEncounterNote = {
  body: Joi.object().keys({
    description: Joi.string().trim().max(ENCOUNTER_NOTE_MAX_LENGTH).required(),
    noteType: Joi.string().valid(...ENCOUNTER_NOTE_TYPES).default('note'),
    encounterId:Joi.number().integer().required(),
    patientId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createEncounterNote,
};
