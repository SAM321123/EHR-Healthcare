const express = require('express');
const { practiceSettingController, practiceController } = require('../../controllers');

const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  // .get(auth(), practiceSettingController.getPracticeSetting)
  .get(practiceSettingController.getPracticeSetting)
  .post(auth(), practiceSettingController.createPracticeSetting)
  .put(auth(), practiceSettingController.updatePracticeSetting);

module.exports = router;
