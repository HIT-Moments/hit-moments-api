const joi = require('joi');

const { objectId } = require('./custom.validation');

const createConversation = {
  body: joi.object({
    participants: joi.array().items(joi.string().custom(objectId)).required().min(2).max(2),
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
