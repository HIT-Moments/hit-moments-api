const joi = require('joi');

const { objectId } = require('./custom.validation');

const createConversation = {
  body: joi.object({
    participant2: joi.string().custom(objectId).required(),
  }),
};

const deleteConversation = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createConversation,
  deleteConversation,
};
