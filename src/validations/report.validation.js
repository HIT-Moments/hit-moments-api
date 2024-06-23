const joi = require('joi');

const { objectId } = require('./custom.validation');

const createReport = {
  body: joi.object({
    description: joi.string().required(),
    postId: joi.string().required().custom(objectId),
  }),
};

const getDetail = {
  params: joi.object({
    reportId: joi.string().required().custom(objectId),
  }),
};

const getList = {
  query: joi.object({
    postId: joi.string().required(),
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

const deleteReport = {
  params: joi.object({
    reportId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createReport,
  getDetail,
  getList,
  deleteReport,
};
