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

const updateFeedbackById = {
  params: joi.object({
    feedbackId: joi.string().required(),
  }),
  body: joi.object({
    content: joi.string().min(10).max(500).required(),
    image: joi.string().required(),
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
  updateFeedbackById,
  deleteFeedbackById
};
