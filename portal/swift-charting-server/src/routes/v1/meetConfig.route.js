const express = require('express');
const { meetConfigController } = require('../../controllers');

const router = express.Router();

router
  .route('/verifyCalendarAccess')
  .get( meetConfigController.verifyCalendarAccess);

  module.exports = router;