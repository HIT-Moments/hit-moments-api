const joi = require('joi');
const { objectId } = require('./custom.validation');

const createReaction = {
  body: joi.object({
    react: joi.string().required(),
    postId: joi.string().required().custom(objectId),
  }),
};

const getReaction = {
  params: joi.object({
    postId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createReaction,
  getReaction,
};
