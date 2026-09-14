const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {officeallyConfigValidation } = require('../../validations');
const { officeAllyConfigController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.officeAllyConfig, { action: AUTH_ACTION.create }), validate(officeallyConfigValidation.createOfficeallyConfig), officeAllyConfigController.createOfficeallyConfig)
  .get(auth(AUTH_MODULE.officeAllyConfig, { action: AUTH_ACTION.read }), validate(officeallyConfigValidation.getOfficeallyConfigs), officeAllyConfigController.getOfficeallyConfigs);

  router
  .route('/:officeallyConfigId')
  .get(auth(AUTH_MODULE.officeAllyConfig, { action: AUTH_ACTION.read }), validate(officeallyConfigValidation.getOfficeallyConfig), officeAllyConfigController.getOfficeallyConfig)
  .put(auth(AUTH_MODULE.officeAllyConfig, { action: AUTH_ACTION.update }), validate(officeallyConfigValidation.updateOfficeallyConfig), officeAllyConfigController.updateOfficeallyConfig);
module.exports = router;