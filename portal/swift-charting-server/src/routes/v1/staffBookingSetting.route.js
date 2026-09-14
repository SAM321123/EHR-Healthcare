const express = require('express');
const { staffBookingSettingController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { staffBookingSettingValidation } = require('../../validations');

const router = express.Router();

router
  .route('/:staffId')
  .get(auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }), validate(staffBookingSettingValidation.getStaffBookingSetting), staffBookingSettingController.getStaffBookingSetting);

router
  .route('/')
  .post(
      auth(AUTH_MODULE.staff,{action:AUTH_ACTION.create}),
      validate(staffBookingSettingValidation.createStaffBookingSetting),
      staffBookingSettingController.createStaffBookingSetting
  );

router
  .route('/:id')
  .put(auth(AUTH_MODULE.staff,{action:AUTH_ACTION.update}), validate(staffBookingSettingValidation.updateStaffBookingSetting), staffBookingSettingController.updateStaffBookingSetting)

module.exports = router;
