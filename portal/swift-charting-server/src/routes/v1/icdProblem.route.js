const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { icdProblemValidation } = require('../../validations');
const { icdProblemController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(
    // auth(AUTH_MODULE.icdProblem, { action: AUTH_ACTION.read }),
    validate(icdProblemValidation.getIcdProblem),
    icdProblemController.getIcdProblem
  );

module.exports = router;
