const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { faxContactValidation } = require('../../validations');
const { faxContactController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.faxContact, { action: AUTH_ACTION.create }), validate(faxContactValidation.createFaxContact), faxContactController.createFaxContact)
  .get(auth(AUTH_MODULE.faxContact, { action: AUTH_ACTION.read }), validate(faxContactValidation.getFaxContacts), faxContactController.getFaxContacts);

router
  .route('/:faxContactId')
  .get(auth(AUTH_MODULE.faxContact, { action: AUTH_ACTION.read }), validate(faxContactValidation.getFaxContact), faxContactController.getFaxContact)
  .put(auth(AUTH_MODULE.faxContact, { action: AUTH_ACTION.update }), validate(faxContactValidation.updateFaxContact), faxContactController.updateFaxContact)

module.exports = router;
