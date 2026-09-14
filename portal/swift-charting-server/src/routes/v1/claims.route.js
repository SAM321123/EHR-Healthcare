const express = require('express');
const  claimsController= require('../../controllers/claims.controller');
const auth = require('../../middlewares/auth');
const { claimsValidation } = require('../../validations');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const validate = require('../../middlewares/validate');


const router = express.Router();

router
  .route('/')
  .get(auth(AUTH_MODULE.claims, { action: AUTH_ACTION.read }), 
  validate(claimsValidation.getClaims), claimsController.getClaims);

router
  .route('/:encounterId')
  .get(
    auth(AUTH_MODULE.claims, { action: AUTH_ACTION.read }),
    validate(claimsValidation.getClaims),
    claimsController.getClaimByEncounterId
  )
  
  module.exports = router;

