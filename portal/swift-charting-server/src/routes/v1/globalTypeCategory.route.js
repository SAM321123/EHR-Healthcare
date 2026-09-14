const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { globalTypeCategoryValidation } = require('../../validations');
const { globalTypeCategoryController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.globalTypeCategory, { action: AUTH_ACTION.create }),
    validate(globalTypeCategoryValidation.createGlobalTypeCategory),
    globalTypeCategoryController.createGlobalTypeCategory
  )
  .get(
    auth(AUTH_MODULE.globalTypeCategory, { action: AUTH_ACTION.read }),
    validate(globalTypeCategoryValidation.getGlobalTypeCategory),
    globalTypeCategoryController.getGlobalTypeCategory
  )

module.exports = router;
