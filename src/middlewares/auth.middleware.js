const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { User } = require('../models');
const { i18n, env } = require('../config');
const { ApiError, catchAsync } = require('../utils');

const auth = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.unauthorized'));
  }

  const payload = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.unauthorized'));
  }

  req.user = user;
  next();
});

const extractToken = (req) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  return token;
};

module.exports = {
  auth,
};
