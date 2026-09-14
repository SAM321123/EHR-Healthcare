const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { formLibraryController } = require('../../controllers');
const {formLibrayValidation} = require('../../validations')

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.create }),
    validate(formLibrayValidation.createForm),
    formLibraryController.createForm
  )
  .get(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.read }),
    validate(formLibrayValidation.getForms),
    formLibraryController.getForms
  );
router
  .route('/:formId')
  .get(
    auth(AUTH_MODULE.form, { action: AUTH_ACTION.read }),
    formLibraryController.getFormById
  );
module.exports = router;
