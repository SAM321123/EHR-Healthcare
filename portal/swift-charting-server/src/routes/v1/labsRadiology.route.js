const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { labsRadiologyValidation } = require('../../validations');
const { labsRadiologyController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.labsRadiology, { action: AUTH_ACTION.create }),
    validate(labsRadiologyValidation.createLabsRadiology),
    labsRadiologyController.createLabsRadiology
  )  .get(
    auth(AUTH_MODULE.labsRadiology, { action: AUTH_ACTION.read }),
    validate(labsRadiologyValidation.getLabsRadiology),
    labsRadiologyController.getLabsRadiology
  )

  router
  .route('/:labsRadiologyId')
  .put(
    auth(AUTH_MODULE.labsRadiology, { action: AUTH_ACTION.update }),
    validate(labsRadiologyValidation.updateLabsRadiology),
    labsRadiologyController.updateLabsRadiology
  )  .get(
    auth(AUTH_MODULE.labsRadiology, { action: AUTH_ACTION.read }),
    validate(labsRadiologyValidation.getLabsRadiology),
    labsRadiologyController.getLabsRadiologyById,
  )
  // .get(
  //   auth(AUTH_MODULE.labsRadiology, { action: AUTH_ACTION.read }),
  //   validate(labsRadiologyValidation.getLabsRadiology),
  //   labsRadiologyController.getLabsRadiology
  // )


  router
  .route('/share/:labRadiologyId')
  .post(
    labsRadiologyController.sharePatientLabRadiology
  )



module.exports = router;

