const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { emailLogsValidation } = require('../../validations');
const emailLogsController = require('../../controllers/emailLogs.controller');

const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.emailLogs, { action: AUTH_ACTION.read }),
    validate(emailLogsValidation.getEmailLogs),
    emailLogsController.getEmailLogs
  );



module.exports = router;
