const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { User } = require('../models');
const { i18n, env } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { sendVerificationEmail } = require('../utils/');

const register = catchAsync(async (req, res) => {
  const existingEmail = await User.findOne({ email: req.body.email });

  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('auth.emailExists'));
  }

  const user = await User.create(req.body);

  const token = generateEmailToken({ email: user.email });
  sendVerificationEmail(user, token);

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('auth.registerSuccess'),
    data: {},
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${env.frontendUrl}/404`);
  }

  try {
    const { email } = jwt.verify(token, env.jwtEmailSecret);

    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.redirect(`${env.frontendUrl}/404`);
    }

    user.isVerified = true;
    await user.save();

    // will change to redirect to verify email success page after frontend is ready
    return res.redirect(`${env.frontendUrl}`);
  } catch (error) {
    return res.redirect(`${env.frontendUrl}/404`);
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidCredentials'));
  }

  if (!user.isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.emailNotVerified'));
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

const generateEmailToken = (payload) => {
  const token = jwt.sign(payload, env.jwtEmailSecret, {
    expiresIn: env.jwtEmailExpire,
  });
  return token;
};

const changePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  const { oldPassword, newPassword } = req.body;

  if (!(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidPassword'));
  }

  Object.assign(user, { password: newPassword });

  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.changePasswordSuccess'),
    data: {
      user,
    },
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  changePassword,
};
