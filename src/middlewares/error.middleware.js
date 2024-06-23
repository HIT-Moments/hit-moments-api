const mongoose = require('mongoose');
const httpStatus = require('http-status');

const { ApiError } = require('../utils');
const { env, i18n } = require('../config');

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  switch (error.message) {
    case 'jwt expired':
      error = new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.tokenExpired'));
      break;
    case 'jwt malformed':
      error = new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidToken'));
      break;
    case 'jwt must be provided':
      error = new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.tokenRequired'));
      break;
    case 'invalid signature':
      error = new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidSignature'));
      break;
    case 'invalid token':
      error = new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidToken'));
      break;
    default:
      break;
  }

  next(error);
};

const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;

  if (env.nodeEnv === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = i18n.translate('system.internalServerError');
  }

  res.locals.errorMessage = err.message;

  const response = {
    statusCode,
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  };

  if (env.nodeEnv === 'development') {
    console.log(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorHandler,
  errorConverter,
};
