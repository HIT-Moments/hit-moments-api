const httpStatus = require('http-status');

const { i18n } = require('../config');
const { User } = require('../models');
const { catchAsync } = require('../utils');
const ApiError = require('../utils/ApiError');

console.log(ApiError);

const createUser = catchAsync(async (req, res, next) => {
  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('user.emailExists'));
  }

  const user = await User.create(req.body);
  return res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    message: i18n.translate('user.createSuccess'),
    data: user,
  });
});

module.exports = {
  createUser,
};
