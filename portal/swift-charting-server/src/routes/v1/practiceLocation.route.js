const express = require('express');
const { practiceLocationController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(auth(), practiceLocationController.createPracticeLocation)
  .get(auth(), practiceLocationController.getPracticeLocations);

router
  .route('/:practiceLocationId')
  .get(auth(), practiceLocationController.getPracticeLocation)
  .put(auth(), practiceLocationController.updatePracticeLocation);

module.exports = router;
