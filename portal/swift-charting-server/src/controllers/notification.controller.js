const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { notificationService, dbService } = require('../services');
const { getModels } = require('../utils/connection');
const { Op } = require('sequelize');

const getNotifications = catchAsync(async (req, res) => {
  const { id,  roles: userRoles = [] } = req.user || {};
  const uuid= req.clinicUuid;
  const subscribedTopicsForUser = notificationService.getSubscribedTopicsForUser({ userRoles});
  const db = getModels(uuid);
  const doc = await dbService.getPaginated({
    model: db.Notification,
    req,
    allowedFilters: ['userId', 'isRead', 'date',],
    searchFilter: [],
    // addOnFilter: { [Op.or]: [{ userId: id }, { topic: { [Op.in]: subscribedTopicsForUser } }] },
    addOnFilter: {  userId: id },

  });
  res.status(httpStatus.OK).send(doc);
});

const getUnreadNotifications = catchAsync(async (req, res) => {
  const uuid= req.clinicUuid;
  if(!uuid){
    return res.status(httpStatus.OK).send({ message: 'Super Admin.' });
  }
    const unreadNotifications = await notificationService.getUnreadNotifications(req.user, req.query,{tenantId:uuid});
    res.status(httpStatus.OK).send(unreadNotifications);
});

const updateNotification = catchAsync(async (req, res) => {
  await notificationService.updateNotification(req);
  res.status(httpStatus.OK).send({ status: 'success' });
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  await notificationService.markAllNotificationsRead(req);
  res.status(httpStatus.OK).send({ status: 'success' });
});

module.exports = {
  getNotifications,
  updateNotification,
  markAllNotificationsRead,
  getUnreadNotifications,
};
