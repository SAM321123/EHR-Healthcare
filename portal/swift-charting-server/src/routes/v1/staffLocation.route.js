const express = require('express');
const { staffLocationController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { staffLocationValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .get(
    // auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }),
    // validate(staffLocationValidation.getLocation),
    staffLocationController.getLocation
  );

router
  .route('/')
  .post(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.create }),
    validate(staffLocationValidation.createLocation),
    staffLocationController.createLocation
  );
router
  .route('/set-primary-location/:id')
  .put(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.update }),
    validate(staffLocationValidation.setPrimaryLocation),
    staffLocationController.setPrimaryLocation
  );
router
  .route('/:id')
  .put(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.update }),
    validate(staffLocationValidation.updateLocation),
    staffLocationController.updateLocation
  )
  .get(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }),
    validate(staffLocationValidation.getLocation),
    staffLocationController.getLocationById
  );

module.exports = router;
