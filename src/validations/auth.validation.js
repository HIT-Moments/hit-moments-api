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

module.exports = {
  register,
  login,
};
