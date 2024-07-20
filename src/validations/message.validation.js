const joi = require('joi');

const { objectId } = require('./custom.validation');

const sendMessage = {
  body: joi.object({
    conversationId: joi.string().custom(objectId).required(),
    text: joi.string().required(),
  }),
};

const getMessages = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  sendMessage,
  getMessages,
};
