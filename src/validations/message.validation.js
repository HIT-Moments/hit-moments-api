const joi = require('joi');

const { objectId } = require('./custom.validation');

const sendMessage = {
  body: joi.object({
    text: joi.string().required(),
  }),
  params: joi.object({
    userId: joi.string().custom(objectId).required(),
  }),
};

const getMessages = {
  params: joi.object({
    userId: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  sendMessage,
  getMessages,
};
