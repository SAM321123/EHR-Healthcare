const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { brandNameDrugController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { brandNameDrugValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.brandNameDrug, { action: AUTH_ACTION.read }),
    validate(brandNameDrugValidation.getBrandNameDrugs),
    brandNameDrugController.getBrandNameDrugs
  );


module.exports = router;
