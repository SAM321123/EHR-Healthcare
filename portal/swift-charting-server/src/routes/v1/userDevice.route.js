const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { userDeviceController } = require('../../controllers');
const { userDevicesValidation } = require('../../validations');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(), userDeviceController.createUserDevice);

module.exports = router;
