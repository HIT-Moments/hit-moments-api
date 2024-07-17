const joi = require('joi');

const { objectId } = require('./custom.validation');

const createConversation = {
  body: joi.object().keys({
    participants: joi.array().items(joi.string().custom(objectId)).required().length(2),
  }),
};

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
  createConversation,
  getMyConversation,
  deleteConversation,
  getListConversationById,
};
