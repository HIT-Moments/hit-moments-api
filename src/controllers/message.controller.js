const https = require('http-status');

const { i18n } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { Message, Conversation } = require('../models');
const { getReceiverSocketId, io } = require('../sockets/socket');

const sendMessage = catchAsync(async (req, res, next) => {
  const senderId = req.user._id;
  const { conversationId, text } = req.body;

  let conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const message = await Message.create({ senderId, ...req.body });

  if (message) {
    conversation.messages.push(message);
    await conversation.save();
  }

  const receiverSocketId = getReceiverSocketId(conversationId);

  if (receiverSocketId) {
    io.to(getReceiverSocketId).emit('message', message);
  }

  res.status(https.OK).json({
    statusCode: https.OK,
    message: i18n.translate('message.sendSucess'),
    data: {
      message,
    },
  });
});

const getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  let conversation = await Conversation.findById(conversationId).populate({
    path: 'messages',
    select: 'senderId text',
    populate: {
      path: 'senderId',
      select: 'fullname avatar',
      model: 'User',
    },
  });

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  if (conversation && conversation.messages) {
    conversation = conversation.toObject();
    conversation.messages = conversation.messages.map((message) => {
      const { senderId, text, ...rest } = message;
      return {
        ...rest,
        sender: senderId,
        text,
      };
    });
  }

  res.json({
    statusCode: https.OK,
    message: i18n.translate('conversation.foundSuccess'),
    data: {
      message: conversation.messages,
    },
  });
});

module.exports = {
  sendMessage,
  getMessages,
};
