const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { i18n } = require('../config');
const { User } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const register = catchAsync(async (req, res) => {
  const existingEmail = await User.findOne({ email: req.body.email });

  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('auth.emailExists'));
  }

  await User.create(req.body);
  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('auth.registerSuccess'),
    data: {},
  });
});

module.exports = {
  register,
};
