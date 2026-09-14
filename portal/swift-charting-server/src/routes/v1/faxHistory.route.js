const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { faxHistoryValidation } = require('../../validations');
const faxHistoryController = require('../../controllers/faxHistory.controller');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.faxHisotry, { action: AUTH_ACTION.create }), validate(faxHistoryValidation.createFaxHistory), faxHistoryController.createFaxHistory)
  .get(auth(AUTH_MODULE.faxHisotry, { action: AUTH_ACTION.read }), validate(faxHistoryValidation.getFaxHistories), faxHistoryController.getFaxHistories);

router
  .route('/:faxHistoryId')
  .get(auth(AUTH_MODULE.faxHisotry, { action: AUTH_ACTION.read }), validate(faxHistoryValidation.getFaxHistory), faxHistoryController.getFaxHistory)
  .put(auth(AUTH_MODULE.faxHisotry, { action: AUTH_ACTION.update }), validate(faxHistoryValidation.updateFaxHistory), faxHistoryController.updateFaxHistory);

module.exports = router;
