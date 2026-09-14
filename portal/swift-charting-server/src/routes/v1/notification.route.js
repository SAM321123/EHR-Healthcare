const express = require('express');
const auth = require('../../middlewares/auth');
const { notificationController } = require('../../controllers');

const router = express.Router();

router
  .route('/getUnreadNotification')
  .get(
    auth(),
    notificationController.getUnreadNotifications
  );

router
  .route('/')
  .get(auth(), notificationController.getNotifications);

router.route('/markAllNotificationsRead').put(auth('updateNotification'), notificationController.markAllNotificationsRead);

router
  .route('/:notificationId')
  .put(auth(),
    notificationController.updateNotification
  );

module.exports = router;
