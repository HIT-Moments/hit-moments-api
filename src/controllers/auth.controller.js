const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { i18n, env } = require('../config');
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

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidCredentials'));
  }

  const accessToken = generateToken({ id: user._id });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.loginSuccess'),
    data: {
      user,
      accessToken,
    },
  });
});

const getMe = async (req, res) => {
  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.getMeSuccess'),
    data: {
      user: req.user,
    },
  });
};

const updateProfile = catchAsync(async (req, res) => {
  const { user } = req;

  Object.assign(user, req.body);

  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.updateProfileSuccess'),
    data: {
      user,
    },
  });
});

const generateToken = (payload) => {
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
  return token;
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
