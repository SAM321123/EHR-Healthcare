/**
 * UserDevice Service module.
 * @module services/userDevice.service
 */

// Import the UserDevice model
const logger = require('../config/logger');
const { getModels } = require('../utils/connection');
const dbService = require('./db.service');

const createUserDevice = async (req) => {
  try {
    const { body, user,clinicUuid:uuid } = req;
    const { device, type } = body || {};
    let userDevice;
    if(req?.user?.loginUserRole !== 'superAdmin'){
      const db = getModels(uuid);
      userDevice = await dbService.upsert({
        model: db.UserDevice,
        reqParams: { type, userId: user.id },
        filter: { where:{device} },
      });
    }

    return userDevice;
  } catch (err) {
    logger.error('🚀 ~ file: userDevice.service.js:42 ~ createUserDevice ~ err:', err);
  }
};



// Export the module functions
module.exports = {
  createUserDevice,
};
