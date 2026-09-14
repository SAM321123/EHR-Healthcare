const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');
const { errorMessages } = require('../config/error');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, tenantId, loginUserRole, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    tenantId,
  };
  if(loginUserRole){
    payload.loginUserRole = loginUserRole;
  }
  return jwt.sign(payload, secret);
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async ({ token, type }, { model }) => {
  const payload = jwt.verify(token, config.jwt.secret);
  let tokenDoc;
  try {
    tokenDoc = await model.findOne({ where: { token, type, userId: payload.sub, blacklisted: false } });
  } catch (err) {
    logger.error('error on verify token', err);
  }
  if (!tokenDoc) {
    throw new Error(errorMessages.TOKEN_NOT_FOUND);
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
*/
const generateAuthTokens = async (user,role=null) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS, user.tenantId,role);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH, user.tenantId,role);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateResetPasswordToken = async (user) => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  return { resetPasswordToken,expires };
};

const generatePasswordToken = async (user) => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }
  const expires = moment().add(config.jwt.generatePasswordExpirationMinutes, 'minutes');
  const generatePasswordToken = generateToken(user.id, expires, tokenTypes.GENERATE_PASSWORD);
  return { generatePasswordToken,expires };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generatePasswordToken,
};
