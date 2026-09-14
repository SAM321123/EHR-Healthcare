const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { socialHistoryValidation } = require('../../validations');
const { socialHistoryController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.socialHistory, { action: AUTH_ACTION.create }),
    validate(socialHistoryValidation.createSocialHistory),
    socialHistoryController.createSocialHistory
  )
  .get(
    auth(AUTH_MODULE.socialHistory, { action: AUTH_ACTION.read }),
    validate(socialHistoryValidation.getSocialHistory),
    socialHistoryController.getSocialHistory
  );

router
  .route('/:socialHistoryId')
  .put(
    auth(AUTH_MODULE.socialHistory, { action: AUTH_ACTION.update }),
    validate(socialHistoryValidation.updateSocialHistory),
    socialHistoryController.updateSocialHistory
  )
  .get(
    auth(AUTH_MODULE.socialHistory, { action: AUTH_ACTION.read }),
    validate(socialHistoryValidation.getSocialHistoryById),
    socialHistoryController.getSocialHistoryById
  );

module.exports = router;
