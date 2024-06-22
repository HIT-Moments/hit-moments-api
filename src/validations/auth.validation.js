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

const login = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
};

const updateProfile = {
  body: joi
    .object({
      fullname: joi.string(),
      email: joi.string().email(),
      password: joi.string().custom(password),
      phoneNumber: joi.string(),
      dob: joi.date().less('now'),
      avatar: joi.string(),
    })
    .min(1),
};

const changePassword = {
  body: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().custom(password).required(),
  }),
};

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};
