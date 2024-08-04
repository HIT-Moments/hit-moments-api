const express = require('express');

const { validate, auth } = require('../../middlewares');
const { conversationValidation } = require('../../validations');
const { conversationController } = require('../../controllers');

const conversationRoute = express.Router();

conversationRoute.use(auth);

conversationRoute.route('/me').get(conversationController.getMyConversations);

conversationRoute
  .route('/:conversationId')
  .get(validate(conversationValidation.getConversationById), conversationController.getConversationById)
  .delete(validate(conversationValidation.deleteConversation), conversationController.deleteConversation);

conversationRoute
  .route('/user/:userId')
  .get(validate(conversationValidation.getConversationsByUser), conversationController.getConversationsByUser);

module.exports = conversationRoute;
