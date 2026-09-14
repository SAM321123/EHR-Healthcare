const express = require('express');
const { staffController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { staffValidation } = require('../../validations');

const router = express.Router();

router.route('/').get(validate(staffValidation.getStaff), staffController.getStaff);
// .route('/')
// .get(
//     auth(AUTH_MODULE.staff,{action:AUTH_ACTION.read}),
//     validate(staffValidation.getStaff),
//     staffController.getStaff
// );
router
  .route('/')
  .post(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.create }),
    validate(staffValidation.createStaff),
    staffController.createStaff
  );
router
  .route('/:staffId')
  .put(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.update }),
    validate(staffValidation.updateStaff),
    staffController.updateStaff
  )
  .get(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }),
    validate(staffValidation.getStaffById),
    staffController.getStaffById
  );

module.exports = router;
