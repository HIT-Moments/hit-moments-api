const express = require('express');

const { feedbackController } = require('../../controllers');
const { feedbackValidation } = require('../../validations');
const { auth, author, upload, validate } = require('../../middlewares');

const feedbackRoute = express.Router();

feedbackRoute.use(auth);  

feedbackRoute
  .route('/')
  .get(author('admin'), feedbackController.getallFeedback)
  .post(upload.single('image'), validate(feedbackValidation.createFeedback), feedbackController.createFeedback);

feedbackRoute 
  .route('/me')
  .get(feedbackController.getMyFeedbacks);

feedbackRoute
  .route('/:feedbackId')
  .get(author('admin'), validate(feedbackValidation.getFeedback), feedbackController.getFeedback)
  .delete(author('admin'), validate(feedbackValidation.deleteFeedbackById), feedbackController.deleteFeedbackById);



module.exports = feedbackRoute;
