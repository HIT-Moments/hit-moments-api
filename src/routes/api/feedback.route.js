const express = require('express');

const { upload, validate } = require('../../middlewares');
const { feedbackController } = require('../../controllers');
const { feedbackValidation } = require('../../validations');

const userRoute = express.Router();

userRoute
  .route('/')
  .post(upload.single('image'), validate(feedbackValidation.createFeedback), feedbackController.createFeedback)
  .get(feedbackController.getallFeedback);

userRoute
  .route('/:feedbackId')
  .get(validate(feedbackValidation.getFeedback), feedbackController.getFeedback)
  .delete(validate(feedbackValidation.deleteFeedbackById), feedbackController.deleteFeedbackById);

module.exports = userRoute;
