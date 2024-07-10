const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { conversationValidation } = require('../../validations');
const { conversationController } = require('../../controllers');

const conversationRoute = express.Router();

conversationRoute.use(auth);

conversationRoute
  .route('/')
  .post(validate(conversationValidation.createConversation), conversationController.createConversation);

conversationRoute.route('/myConversation').get(conversationController.getMyConversation);

conversationRoute.use(author(['admin']));

conversationRoute
  .route('/')
  .get(validate(conversationValidation.getListConversations), conversationController.getListConversations);

conversationRoute
  .route('/:conversationId')
  .delete(validate(conversationValidation.deleteConversation), conversationController.deleteConversation);

module.exports = conversationRoute;
