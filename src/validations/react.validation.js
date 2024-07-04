const joi = require('joi');
const { objectId } = require('./custom.validation');

const sendReaction = {
  body: joi.object({
    react: joi.string().required(),
    momentId: joi.string().required().custom(objectId),
  }),
};

const getReaction = {
  params: joi.object({
    momentId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  sendReaction,
  getReaction,
};
