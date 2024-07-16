const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { i18n, env } = require('../config');
const { User, Friend } = require('../models');
const { ApiError, catchAsync, formatEmail } = require('../utils');
const { generateOtp, sendOtpEmail, sendVerificationEmail } = require('../services/');

const register = catchAsync(async (req, res) => {
  const { email } = req.body;
  const existingEmail = await User.findOne({ formattedEmail: formatEmail(email) });

  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('auth.emailExists'));
  }

  const user = await User.create({ ...req.body, formattedEmail: formatEmail(email) });

  await Friend.create({ userId: user._id });

  const token = generateEmailToken({ email });
  sendVerificationEmail({ user, token });

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
    const { email } = jwt.verify(token, env.jwtVerifyEmailSecret);

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

const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ formattedEmail: formatEmail(email) });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('auth.userNotFound'));
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('auth.emailAlreadyVerified'));
  }

  const now = new Date();

  if (
    user.lastVerificationEmailSentAt &&
    user.lastVerificationEmailSentAt > new Date(now.getTime() - env.emailResendTime)
  ) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, i18n.translate('auth.emailResendTimeout'));
  }

  const token = generateEmailToken({ email: user.email });
  sendVerificationEmail({ user, token });

  user.lastVerificationEmailSentAt = now;
  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.verificationEmailResent'),
    data: {},
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ formattedEmail: formatEmail(email) }).select('+password');

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.invalidCredentials'));
  }

  if (!user.isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, i18n.translate('auth.emailNotVerified'));
  }

  user.password = undefined;

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

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ formattedEmail: formatEmail(email) });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('auth.userNotFound'));
  }

  const otp = generateOtp();
  sendOtpEmail({ user, otp });

  const now = new Date();
  user.otp = otp;
  user.otpExpiredAt = new Date(now.getTime() + env.otpExpireTime);
  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.resetPasswordEmailSent'),
    data: {},
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ formattedEmail: formatEmail(email) });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('auth.userNotFound'));
  }

  if (user.otp !== otp || user.otpExpiredAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('auth.invalidOtp'));
  }

  const otpToken = generateOtpToken({ email: user.email });

  user.otp = null;
  user.otpExpiredAt = null;
  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('auth.otpVerified'),
    data: {
      otpToken,
    },
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { otpToken, password } = req.body;

  try {
    const { email } = jwt.verify(otpToken, env.jwtOtpSecret);

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('auth.userNotFound'));
    }

    Object.assign(user, { password });
    await user.save();

    res.status(httpStatus.OK).json({
      statusCode: httpStatus.OK,
      message: i18n.translate('auth.resetPasswordSuccess'),
      data: {},
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('auth.invalidToken'));
  }
});

const generateToken = (payload) => {
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
  return token;
};

const generateEmailToken = (payload) => {
  const token = jwt.sign(payload, env.jwtVerifyEmailSecret, {
    expiresIn: env.jwtVerifyEmailExpire,
  });
  return token;
};

const generateOtpToken = (payload) => {
  const token = jwt.sign(payload, env.jwtOtpSecret, {
    expiresIn: env.jwtOtpExpire,
  });
  return token;
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
