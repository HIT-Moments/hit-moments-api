const joi = require('joi');
const { objectId } = require('./custom.validation');

const createMoment = {
  body: joi.object({
    image: joi.string().optional(),
    content: joi.string(),
    music: joi.string().custom(objectId),
    location: joi.string(),
    weather: joi.string(),
  }),
};

const getMoments = {
  query: joi.object({
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

const getMoment = {
  params: joi.object({
    momentId: joi.string().custom(objectId),
  }),
};

const updateMoment = {
  params: joi.object({
    momentId: joi.required().custom(objectId),
  }),
  body: joi
    .object({
      userId: joi.string().custom(objectId),
      image: joi.string(),
      content: joi.string(),
      music: joi.string().custom(objectId),
      location: joi.string(),
      weather: joi.string(),
    })
    .min(1),
};

const deleteMoment = {
  params: joi.object({
    momentId: joi.string().custom(objectId),
  }),
};

const getMomentsByUser = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
};

module.exports = {
  createMoment,
  getMoments,
  getMoment,
  updateMoment,
  deleteMoment,
  getMomentsByUser,
};
