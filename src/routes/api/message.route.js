const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { messageValidation } = require('../../validations');
const { messageController } = require('../../controllers');

const messageRoute = express.Router();

messageRoute.use(auth);

messageRoute.route('/send').post(validate(messageValidation.sendMessage), messageController.sendMessage);
messageRoute.route('/:conversationId').get(validate(messageValidation.getMessages), messageController.getMessages);
module.exports = messageRoute;
