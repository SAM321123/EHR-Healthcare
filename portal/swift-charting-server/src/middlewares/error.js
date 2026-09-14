/* eslint-disable no-shadow */
/* eslint-disable no-empty */
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { dbContextVar } = require('../utils/asyncStorage/contextVar');
const { errorMessages } = require('../config/error');
const { authService } = require('../services');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;
  console.log('🚀 ~ errorHandler ~ statusCode:', statusCode);
  try {
    const dbContext = dbContextVar.get();
    const { masterTransaction, clinicTransaction } = dbContext || {};
    if (masterTransaction && !(masterTransaction.finished === 'rollback' || masterTransaction.finished === 'commit')) {
      await masterTransaction.rollback();
    }
    if (clinicTransaction && !(clinicTransaction.finished === 'rollback' || clinicTransaction.finished === 'commit')) {
      clinicTransaction.rollback();
    }
  } catch (err) {}
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;
  if (err.message === errorMessages.PLEASE_AUTHENTICATE || err.message === errorMessages.USER_INACTIVE) {
    let refreshToken = req.cookies.refresh_token;
    if (err.message === errorMessages.USER_INACTIVE) {
      refreshToken = '';
    }
    authService.setTokenOnResponseHeader(
      {
        refresh: { expires: new Date(), token: refreshToken },
        access: { expires: new Date(), token: '' },
      },
      res
    );
  }
  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
