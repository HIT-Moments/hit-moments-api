const joi = require('joi');
const { objectId } = require('./custom.validation');

const createMusic = {
  body: joi.object({
    file: joi.string().optional(),
    name: joi.string().max(50).required(),
    author: joi.string().max(50).required(),
  }),
};

const getMusicByID = {
  params: joi.object({
    musicId: joi.string().required(),
  }),
}

const getMusic = {
  body: joi.object({
    id: joi.string().custom(objectId),
    link: joi.string(),
    name: joi.string().max(50),
    author: joi.string().max(50),
    file: joi.string().optional(),
  }),
};

const updateMusic = {
  params: joi.object({
    musicId: joi.string().required(),
  }),
  body: joi.object({
    name: joi.string().max(50),
    link: joi.string(),
    author: joi.string().max(50),
  }),
};

module.exports = {
  createMusic,
  getMusic,
  updateMusic,
  getMusicByID,
}
