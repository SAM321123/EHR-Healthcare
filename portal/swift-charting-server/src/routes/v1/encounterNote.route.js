const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { encounterNoteValidation } = require('../../validations');
const { encounterNoteController } = require('../../controllers')

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.create }),
    validate(encounterNoteValidation.createEncounterNote),
    encounterNoteController.createEncounterNote
  )
    
module.exports = router;
