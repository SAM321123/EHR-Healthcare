const express = require('express');
const procedureCodeController = require('../../controllers/procedureCode.controller');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { procedureCodeValidation } = require('../../validations');
const validate = require('../../middlewares/validate');
const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.procedureCode,{action:AUTH_ACTION.create}),validate(procedureCodeValidation.createProcedureCode),procedureCodeController.createProcedureCode)
  .get(
    // auth(AUTH_MODULE.procedureCode, { action: AUTH_ACTION.read }),
    // validate(procedureCodeValidation.getProcedureCodes),
    
    procedureCodeController.getProcedureCode
  );

  router
  .route('/:procedureCodeId')
  .put(
    auth(AUTH_MODULE.procedureCode, { action: AUTH_ACTION.update }),
    validate(procedureCodeValidation.updateProcedureCode),
    procedureCodeController.updateProcedureCode
  )
  .get(
    auth(AUTH_MODULE.procedureCode, { action: AUTH_ACTION.read }),
    validate(procedureCodeValidation.getProcedureCodeById),
    procedureCodeController.getProcedureCodeById
  );
  
module.exports = router;
