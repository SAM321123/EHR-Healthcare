const ApiError = require('../utils/ApiError');
const { dbService } = require('.');
const { getModels } = require('../utils/connection');
const httpStatus = require('http-status');
const { cleanIp } = require('../utils');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const axios = require('axios');
const getLocation = require('./location.service');


const loginLogsEntry = async (email, req, role, status, deviceId) => {
  try {
    const { clinicUuid } = req;
    const isSuperAdmin = role === 'superAdmin';
    const db = isSuperAdmin ? initializeModels(sequelize, true) : getModels(clinicUuid);
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const deviceDetail = req.headers['user-agent'];
    const location = await getLocation(userIp)
    const createloginLog = await dbService.createOne({
      model: db.LoginLogs,
      reqParams: {
        email,
        userIp,
        deviceDetail,
        status,
        deviceId,
        country: location.country,
        state : location.state,
        city: location.city,
      },
    });
  } catch (error) {
    console.error('Error in storing logs:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  loginLogsEntry,
};
