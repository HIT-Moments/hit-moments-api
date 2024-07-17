const joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: joi.object({
    fullname: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().custom(password).required(),
    phoneNumber: joi.string().required(),
    dob: joi.date().less('now').required(),
  }),
};

const verifyEmail = {
  query: joi.object({
    token: joi.string().required(),
  }),
};

const resendVerificationEmail = {
  body: joi.object({
    email: joi.string().email().required(),
  }),
};

const login = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
};

const updateProfile = {
  body: joi.object({
    fullname: joi.string(),
    email: joi.string().email(),
    password: joi.string().custom(password),
    phoneNumber: joi.string(),
    dob: joi.date().less('now'),
    avatar: joi.string().optional(),
  }),
};

const changePassword = {
  body: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().custom(password).required(),
  }),
};

const forgotPassword = {
  body: joi.object({
    email: joi.string().email().required(),
  }),
};

const verifyOtp = {
  body: joi.object({
    email: joi.string().email().required(),
    otp: joi.string().required(),
  }),
};

const resetPassword = {
  body: joi.object({
    otpToken: joi.string().required(),
    password: joi.string().custom(password).required(),
  }),
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
