const joi = require('joi');
const { objectId } = require('./custom.validation');

const createMusic = {
  body: joi.object({
    file: joi.string().optional(),
    name: joi.string().max(50).required(),
    author: joi.string().max(50).required(),
  }),
};

const getMusicById = {
  params: joi.object({
    musicId: joi.string().required(),
  }),
}

const searchMusic = {
  body: joi.object({
    name: joi.string().max(50),
    author: joi.string().max(50),
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

const deleteMusic = {
  params: joi.object({
    musicId: joi.string().required(),
  }),
}

module.exports = {
  createMusic,
  searchMusic,
  updateMusic,
  getMusicById,
  deleteMusic,
}
