const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { socialHistoryValidation } = require('../../validations');
const { formController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.create }),
    formController.createForm
  )
  .get(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.read }),
    formController.getForms
  );

  router
  .route('/share-form/:formId')
  .get(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.read }),
    formController.shareForm
  );
router
  .route('/:formId')
  .put(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.update }),
    formController.updateForm
  )
  .get(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.read }),
    formController.getFormById
  );

module.exports = router;
