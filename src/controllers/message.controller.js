const https = require('http-status');

const { i18n } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { Message, Conversation } = require('../models');
const { getReceiverSocketId, io } = require('../socket/socket');

const sendMessage = catchAsync(async (req, res, next) => {
  const senderId = req.user._id;
  const { userId: receiverId } = req.params;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const message = new Message({
    senderId,
    text: req.body.text,
  });

  if (message) {
    conversation.messages.push(message);
  }

  await Promise.all([message.save(), conversation.save()]);

  const receiverSocketId = getReceiverSocketId(receiverId);

  if (receiverSocketId) {
    console.log('emitting');
    io.to(receiverSocketId).emit('newMessage', message);
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
  const userId = req.user._id;
  const { userId: receiverId } = req.params;

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, receiverId] },
  }).populate({
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
