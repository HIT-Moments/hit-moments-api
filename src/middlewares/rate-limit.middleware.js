const httpStatus = require('http-status');
const rateLimit = require('express-rate-limit');

const { i18n } = require('../config');
const { TIME_LIMIT, MAX_REQUESTS } = require('../constants/');

const limiter = (timeLimit = TIME_LIMIT, maxRequests = MAX_REQUESTS) =>
  rateLimit({
    windowMs: timeLimit * 60 * 1000,
    limit: maxRequests,
    message: {
      statusCode: httpStatus.TOO_MANY_REQUESTS,
      message: i18n.translate('rateLimit.tooManyRequests'),
    },
  });

module.exports = limiter;
