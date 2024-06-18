const joi = require('joi');

const createReport = {
  body: joi.object({
    description: joi.string().required(),
    postId: joi.string().required(),
  }),
};

const getDetail = {
  params: joi.object({
    reportId: joi.string().required(),
  }),
};

const getList = {
  query: joi.object({
    postId: joi.string().required(),
  }),
};

const deleteReport = {
  params: joi.object({
    reportId: joi.string().required(),
  }),
};

module.exports = {
  createReport,
  getDetail,
  getList,
  deleteReport,
};
