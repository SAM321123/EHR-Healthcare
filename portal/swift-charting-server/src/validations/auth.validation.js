const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    deviceId: Joi.string(),
    browserTimezone: Joi.string(),
  }),
};
const verifyAndLogin = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    code: Joi.string().required(),
    role: Joi.string(),
    deviceId: Joi.string(),
    browserTimezone: Joi.string(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken:Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const isValidToken = {
  query: Joi.object().keys({
    token: Joi.string().required(),
    isGeneratePassword: Joi.boolean()
  }),
};

const validateToken = {
  query: Joi.object().keys({
    device: Joi.string(),
    type: Joi.string(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  isValidToken,
  validateToken,
  changePassword,
  verifyAndLogin,
};
