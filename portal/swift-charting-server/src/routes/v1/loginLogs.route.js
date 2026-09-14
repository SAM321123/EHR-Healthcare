const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { loginLogsValidation } = require('../../validations');
const loginLoginController  = require('../../controllers/loginLogs.controller');

const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.invoice, { action: AUTH_ACTION.read }),
    validate(loginLogsValidation.getLoginLogs),
    loginLoginController.getLoginLogs
  );



module.exports = router;
