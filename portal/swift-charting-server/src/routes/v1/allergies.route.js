const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { allergiesValidation } = require('../../validations');
const { allergiesController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.allergies, { action: AUTH_ACTION.create }),
    validate(allergiesValidation.createAllergies),
    allergiesController.createAllergies
  )
  .get(auth(AUTH_MODULE.patient,validate(allergiesValidation.getAllergies), { action: AUTH_ACTION.read }), allergiesController.getAllergies);

router
  .route('/:allergiesId')
  .put(auth(AUTH_MODULE.allergies,{action:AUTH_ACTION.update}), validate(allergiesValidation.updateAllergies), allergiesController.updateAllergiesById)
  .get(
    auth(AUTH_MODULE.patient, { action: AUTH_ACTION.read }),
    validate(allergiesValidation.getAllergiesById),
    allergiesController.getAllergiesById
  );

module.exports = router;
