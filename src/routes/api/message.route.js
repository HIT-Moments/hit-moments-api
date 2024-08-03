const express = require('express');

const { validate, auth } = require('../../middlewares');
const { messageValidation } = require('../../validations');
const { messageController } = require('../../controllers');

const messageRoute = express.Router();

messageRoute.use(auth);

messageRoute
  .route('/:userId')
  .get(validate(messageValidation.getMessages), messageController.getMessages)
  .post(validate(messageValidation.sendMessage), messageController.sendMessage);
module.exports = messageRoute;
