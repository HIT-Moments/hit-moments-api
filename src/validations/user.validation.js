const joi = require('joi');

const { objectId, password } = require('./custom.validation');

const createUser = {
  body: joi.object({
    fullname: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().custom(password),
    phoneNumber: joi.string(),
    dob: joi.date().less('now'),
    avatar: joi.string(),
    isLocked: joi.boolean().valid(true, false),
    isVerified: joi.boolean().valid(true, false),
  }),
};

const getUsers = {
  query: joi.object({
    limit: joi.number(),
    page: joi.number(),
  }),
};

const getUser = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
};
