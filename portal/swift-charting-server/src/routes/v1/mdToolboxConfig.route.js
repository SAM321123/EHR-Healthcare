const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {mdToolboxConfigValidation } = require('../../validations');
const { mdToolboxConfigController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.mdToolboxConfig, { action: AUTH_ACTION.create }), validate(mdToolboxConfigValidation.createMdTollboxConfig), mdToolboxConfigController.createMdToolboxConfig)
  .get(auth(AUTH_MODULE.mdToolboxConfig, { action: AUTH_ACTION.read }), validate(mdToolboxConfigValidation.getMdToolboxConfigs), mdToolboxConfigController.getMdToolboxConfigs);

  router
  .route('/:mdToolboxConfigId')
  .get(auth(AUTH_MODULE.mdToolboxConfig, { action: AUTH_ACTION.read }), validate(mdToolboxConfigValidation.getMdToolboxConfig), mdToolboxConfigController.getMdToolboxConfig)
  .put(auth(AUTH_MODULE.mdToolboxConfig, { action: AUTH_ACTION.update }), validate(mdToolboxConfigValidation.updateMdToolboxConfig), mdToolboxConfigController.updateMdToolboxConfig);
module.exports = router;
