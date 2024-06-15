const joi = require('joi');

const createUser = {
  body: joi.object({
    fullname: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phoneNumber: joi.string(),
    dob: joi.date(),
    avatar: joi.string(),
    isLocked: joi.boolean().valid(true, false),
    isVerified: joi.boolean().valid(true, false),
  }),
};

module.exports = {
  createUser,
};
