const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { genericDrugController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { genericDrugValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.genericDrug, { action: AUTH_ACTION.read }),
    validate(genericDrugValidation.getGenricDrugs),
    genericDrugController.getGenricDrugs
  );


module.exports = router;
