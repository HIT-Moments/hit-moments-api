const joi = require('joi');

const { objectId } = require('./custom.validation');

const getMyConversation = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
};

const deleteConversation = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

const getListConversationById = {
  params: joi.object({
    conversationId: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getMyConversation,
  deleteConversation,
  getListConversationById,
};
