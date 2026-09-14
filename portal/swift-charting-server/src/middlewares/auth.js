/* eslint-disable no-unused-vars */
const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights, roles } = require('../config/roles');
const { errorMessages } = require('../config/error');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { getPracticeAccessStatus } = require('../utils/subscriptionAccess');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, errorMessages.PLEASE_AUTHENTICATE));
  }

  req.user = user;
  if (!user.isActive) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, errorMessages.USER_INACTIVE));
  }

  if(req?.clinicUuid){
    const masterDB = initializeModels(sequelize, true); 
    const accessStatus = await getPracticeAccessStatus({
      masterDB,
      practiceId: req.clinicUuid,
      user,
    });

    if (!accessStatus.allowed) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, accessStatus.message));
    }
  }
  
  if(requiredRights.length){
    const { permission: modulePermissions,loginUserRole } = user;
    if(loginUserRole !== 'clinicAdmin' && loginUserRole !== 'superAdmin'){
      if (requiredRights[1] && typeof requiredRights[1] === 'object') {
        try{
          if(modulePermissions){
            const action = requiredRights[1].action;
            const moduleName = requiredRights[0];
            const lowercased = moduleName.toLowerCase(); // Convert to lowercase
            const formattedName = lowercased.charAt(0).toUpperCase() + lowercased.slice(1); 
            // Find unique permissions where apiRoute matches
            const permissions = [
              ...new Set(
                Object.values(modulePermissions)
                  .filter(item => item.apiRoute === lowercased)
                  .flatMap(item => item.permission)
              )
            ];
            // const permissions = modulePermissions[lowercased]?.permission;
            // const permissions = modulePermissions[formattedNAme]?.permission;
            // console.log('permissions------------------->', permissions, 
            //   (!permissions || (action === 'read' && permissions.length === 0) || (action !== 'read' && !permissions.includes(action))),
            //   !permissions,
            //   (action === 'read' && permissions?.length === 0),
            //   (action !== 'read' && !permissions.includes(action)),
            //   permissions?.length === 0,
            //   action === 'read', 
            //   )
            if (!permissions || (action === 'read' && permissions?.length === 0) || (action !== 'read' && !permissions?.includes(action))) {
              console.log('consoleUNAUTHORIZED 1')
              return reject(new ApiError(httpStatus.FORBIDDEN, errorMessages.PERMISSION_DENIED));
            }
            if(action === 'read'){
              // if(modulePermissions[lowercased]?.permission?.length > 0 ){
              if(permissions?.length > 0 ){
              }else{
                console.log('consoleUNAUTHORIZED 2')
                return reject(new ApiError(httpStatus.FORBIDDEN, errorMessages.PERMISSION_DENIED));
              }
            }else{
              if(!permissions.includes(action)){
              // if(!modulePermissions[lowercased]?.permission.include(action)){
                console.log('consoleUNAUTHORIZED 3')
                return reject(new ApiError(httpStatus.FORBIDDEN, errorMessages.PERMISSION_DENIED));
              }
            }
          }else{
            console.log('consoleUNAUTHORIZED 4')
            return reject(new ApiError(httpStatus.FORBIDDEN, errorMessages.PERMISSION_DENIED));
          }
          
        }catch (error) {
          console.log('errors-->',error)
        }
      }
    } 
  }

  

  // if (requiredRights.length) {
  //   const hasRequiredRights = true;
  //   if (!hasRequiredRights && req.params.userId !== user.id) {
  //     return reject(new ApiError(httpStatus.FORBIDDEN, 'User not authorized for this action'));
  //   }
  // }
  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
