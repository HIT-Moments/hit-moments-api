const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { conversationValidation } = require('../../validations');
const { conversationController } = require('../../controllers');

const conversationRoute = express.Router();

conversationRoute.use(auth);

conversationRoute
  .route('/my-conversation')
  .get(validate(conversationValidation.getMyConversation), conversationController.getMyConversation);

conversationRoute.use(author(['admin']));

conversationRoute.route('/').get(conversationController.getListConversations);

conversationRoute
  .route('/:conversationId')
  .delete(validate(conversationValidation.deleteConversation), conversationController.deleteConversation)
  .get(validate(conversationValidation.getListConversationById), conversationController.getListConversationById);

module.exports = conversationRoute;
