/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-new */

const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');
const { getPracticeAccessStatus } = require('../utils/subscriptionAccess');

const subscriptionStatusCheck = () => {
  return async (req, res, next) => {
    try {
      const uuid = req.clinicUuid;
      const { body } = req;

      const { role } = body;
      const isSuperAdmin = role === 'superAdmin';
      const db = isSuperAdmin ? initializeModels(sequelize, true) : getModels(uuid);
      
      const masterDB = initializeModels(sequelize, true);
      
      if(uuid){
        const user = await dbService.getOne({
          model: db.User, 
          filter: { where: { email: body?.email } },
          include: [{ model: db.Role, as: 'roles' }] 
        });

        const accessStatus = await getPracticeAccessStatus({
          masterDB,
          practiceId: uuid,
          user,
        });

        if (!accessStatus.allowed) {
          return res.status(403).json({ message: accessStatus.message });
        }
      }
      next();
    } catch (error) {
      console.error('Error in subscriptionStatusCheck:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
 
module.exports = subscriptionStatusCheck;
