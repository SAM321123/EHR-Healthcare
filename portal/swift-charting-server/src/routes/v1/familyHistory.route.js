const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { familyHistoryValidation } = require('../../validations');
const { familyHistoryController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.familyHistory, { action: AUTH_ACTION.create }),
    validate(familyHistoryValidation.createFamilyHistory),
    familyHistoryController.createFamilyHistory
  )
  .get(
    auth(AUTH_MODULE.familyHistory, { action: AUTH_ACTION.read }),
    validate(familyHistoryValidation.getFamilyHistory),
    familyHistoryController.getFamilyHistory
  );

router
  .route('/:familyHistoryId')
  .put(
    auth(AUTH_MODULE.familyHistory, { action: AUTH_ACTION.update }),
    validate(familyHistoryValidation.updateFamilyHistory),
    familyHistoryController.updateFamilyHistory
  )
  .get(
    auth(AUTH_MODULE.familyHistory, { action: AUTH_ACTION.read }),
    validate(familyHistoryValidation.getFamilyHistoryById),
    familyHistoryController.getFamilyHistoryById
  );

module.exports = router;
