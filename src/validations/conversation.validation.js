const joi = require('joi');

const { objectId } = require('./custom.validation');

const deleteConversation = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

const getConversationById = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

const getConversationsByUser = {
  params: joi.object({
    userId: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  deleteConversation,
  getConversationById,
  getConversationsByUser,
};
