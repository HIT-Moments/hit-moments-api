const https = require('http-status');

const { i18n } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { Message, Conversation } = require('../models');
const { getReceiverSocketId, io } = require('../sockets/socket');

const sendMessage = catchAsync(async (req, res, next) => {
  const { conversationId, senderId, text } = req.body;

  let conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const message = await Message.create({ conversationId: conversationId, senderId: senderId, text: text });

  if (message) {
    conversation.messages.push(message);
  }

  await conversation.save();
  const receiverSocketId = getReceiverSocketId(conversationId);

  if (receiverSocketId) {
    io.to(getReceiverSocketId).emit('message', message);
  }

  res.status(https.OK).json({
    statusCode: https.OK,
    message: i18n.translate('message.sendSuccess'),
    data: {
      message,
    },
  });
});

const getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  let conversation = await Conversation.findById(conversationId).populate('messages', 'text');

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const message = conversation.messages;

  res.status(https.OK).json({
    statusCode: https.OK,
    message: i18n.translate('message.getSuccess'),
    data: {
      message,
    },
  });
});

module.exports = {
  sendMessage,
  getMessages,
};
