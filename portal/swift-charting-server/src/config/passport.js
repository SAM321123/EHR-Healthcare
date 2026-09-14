const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { sequelize } = require('./database');
const { tokenTypes } = require('./tokens');
const { getModels } = require('../utils/connection');
const userActivityCache = new Map(); // Cache for user activity times
const dbService = require('../services/db.service');
const {modulePermission} = require('../utils');
const userRoleModel = require('../models/userRole.model');
const { initializeModels } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const uuid = payload.tenantId;
    const db = payload.loginUserRole === 'superAdmin' ? initializeModels(sequelize, master=true) : getModels(uuid);
    const user = await db.User.findOne({
      where: { id: payload.sub },
      include: [{ model: db.Role, as: 'roles' }],
    });
    if (!user) {
      return done(null, false);
    }
    let plainUser = user.get({ plain: true });
    // payload.loginUserRole;
    if(payload?.loginUserRole && payload?.loginUserRole !== 'superAdmin'){
        const result = await dbService.getAll({
          model: db.Role,
          filter: {where: {code:payload.loginUserRole}},
          otherOptions: {
            include: [{
              model: db.RoleAndPermissions,
              as: 'RoleAndPermission',
              include: [
                { model: db.Module, as: "module" },
                { model: db.GlobalType, as: "permissions" }
              ]
            }]
          }
        });

      const permission = modulePermission(result);
      plainUser.permission = permission;
    } 
    plainUser.loginUserRole = payload?.loginUserRole
  
    const now = new Date();
    const cachedLastActivity = userActivityCache.get(user.id);

    // Check if lastActivity needs to be updated
    if (!cachedLastActivity || (now - cachedLastActivity) > 60000) {
      userActivityCache.set(user.id, now); // Update cache with new time
      await user.update({ lastActivity: now });
    }

    if(!plainUser){
      plainUser = user;
    }else{
      plainUser.lastActivity = user.lastActivity;
    }

    
    // done(null, user);
    done(null, plainUser);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
