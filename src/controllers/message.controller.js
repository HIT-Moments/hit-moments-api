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
    },
  });

  if (!conversation) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const message = conversation.messages.map((msg) => ({
    _id: msg._id,
    text: msg.text,
    sender: {
      _id: msg.senderId._id,
      fullname: msg.senderId.fullname,
      avatar: msg.senderId.avatar,
    },
    senderId: msg.senderId._id,
  }));

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
