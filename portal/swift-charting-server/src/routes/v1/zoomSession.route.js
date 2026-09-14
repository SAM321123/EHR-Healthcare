const express = require('express');
const auth = require('../../middlewares/auth');
const { zoomSessionController } = require('../../controllers');


const router = express.Router();

router
  .route('/add-invite')
  .post(auth(), zoomSessionController.addZoomSessionInvite);

  router
  .route('/validate-invite')
  .post(auth(), zoomSessionController.validateZoomSessionInvite);

module.exports = router;
