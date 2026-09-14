const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { emailTemplateValidation } = require('../../validations');
const { emailTemplateController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');
const { emailComposedController } =require('../../controllers')

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.emailComposed, { action: AUTH_ACTION.create }), emailComposedController.sendBulkEmail)
  .get(auth(AUTH_MODULE.emailComposed, { action: AUTH_ACTION.read }), validate(emailTemplateValidation.getEmailTemplates), emailComposedController.getEmailComposed);

router
  .route('/:id')
  .get(auth(AUTH_MODULE.emailComposed, { action: AUTH_ACTION.read }), validate(emailTemplateValidation.getEmailTemplates), emailComposedController.getEmailComposedById);

module.exports = router;
