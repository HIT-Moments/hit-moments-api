const joi = require('joi');

const createFeedback = {
  body: joi.object({
    content: joi.string().required(),
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
    content: joi.string().required(),
    img: joi.string().required(),
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
