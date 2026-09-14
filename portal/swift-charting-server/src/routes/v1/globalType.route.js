const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { globalTypeyValidation } = require('../../validations');
const { globalTypeController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();

router
  .route('/all')
  .get(
    auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.read }),
    validate(globalTypeyValidation.getGlobalTypes),
    globalTypeController.getAllGlobalTypes
  )

router
  .route('/sort-order')
  .get(
    auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.read }),
    validate(globalTypeyValidation.getGlobalTypeSortList),
    globalTypeController.getGlobalTypeSortList
  )
  router
  .route('/rearrange-sort-order')
  .put(
    auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.update }),
    validate(globalTypeyValidation.sortOrder),
    globalTypeController.updateSortOrder
  )

router
  .route('/update/:globalTypeId')
  .put(
    auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.update }),
    validate(globalTypeyValidation.updateGlobalType),
    globalTypeController.updateGlobalType
  )

router
  .route('/:globalCategoryTypeCode')
  .get(
    // auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.read }),
    validate(globalTypeyValidation.getGlobalTypes),
    globalTypeController.getGlobalTypes
  )
  // .route('/:globalCategoryTypeCode')
  // .get(
  //   auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.read }),
  //   validate(globalTypeyValidation.getGlobalTypes),
  //   globalTypeController.getGlobalTypes
  // )
  .post(
    auth(AUTH_MODULE.globalType, { action: AUTH_ACTION.create }),
    validate(globalTypeyValidation.createGlobalType),
    globalTypeController.createGlobalType
  );

module.exports = router;
