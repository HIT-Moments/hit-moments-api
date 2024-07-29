const joi = require('joi');

const createFeedback = {
  body: joi.object({
    content: joi.string().min(10).max(500).required(),
  }),
};

const getFeedback = {
  params: joi.object({
    feedbackId: joi.string().required(),
  }),
};

const getAllFeedback = {
  query: joi.object({
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

const updateFeedbackById = {
  params: joi.object({
    feedbackId: joi.string().required(),
  }),
  body: joi.object({
    content: joi.string().min(10).max(500),
    image: joi.string(),
  }),
};

const deleteFeedbackById = {
  params: joi.object({
    feedbackId: joi.string().required(),
  }),
};

module.exports = {
  createFeedback,
  getFeedback,
  getAllFeedback,
  updateFeedbackById,
  deleteFeedbackById,
};
