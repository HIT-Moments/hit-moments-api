const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Conversation } = require('../models');
const { USER_ROLE } = require('../constants');
const { ApiError, catchAsync } = require('../utils');

const getConversationById = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  let conversation = await Conversation.findById(conversationId)
    .populate({
      path: 'messages',
      select: 'senderId text createdAt',
      populate: {
        path: 'senderId',
        select: 'fullname avatar',
      },
    })
    .populate({
      path: 'participants',
      select: 'fullname avatar',
    });

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  conversation = conversation.toObject();
  conversation.messages = conversation.messages.map((message) => ({
    ...message,
    sender: {
      _id: message.senderId._id,
      fullname: message.senderId.fullname,
      avatar: message.senderId.avatar,
    },
    senderId: undefined,
  }));

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationByIdSuccess'),
    data: {
      conversation,
    },
  });
});

const getConversationsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('conversation.userIdRequired'));
  }

  if (userId !== req.user.id && req.user.role !== USER_ROLE.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('conversation.getConversationByUserForbidden'));
  }

  const conversations = await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate({ path: 'participants', select: 'fullname avatar' })
    .populate({ path: 'messages', select: 'text', options: { sort: { createdAt: -1 } } })
    .exec();

  const conversationsWithLastMessage = conversations.map((conversation) => {
    const user = conversation.participants.find((participant) => participant._id.toString() !== userId);
    return {
      _id: conversation._id,
      user,
      lastMessage: conversation.messages[0]?.text || '',
    };
  });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationByUserSuccess'),
    data: {
      conversations: conversationsWithLastMessage,
    },
  });
});

const getMyConversations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const conversations = await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate({ path: 'participants', select: 'fullname avatar' })
    .populate({ path: 'messages', select: 'text', options: { sort: { createdAt: -1 } } })
    .exec();

  const conversationsWithLastMessage = conversations.map((conversation) => {
    const user = conversation.participants.find((participant) => participant._id.toString() !== userId);
    return {
      _id: conversation._id,
      user,
      lastMessage: conversation.messages[0]?.text || '',
    };
  });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationByUserSuccess'),
    data: {
      conversations: conversationsWithLastMessage,
    },
  });
});

const deleteConversation = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findByIdAndDelete(conversationId);
  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  res.json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.deleteSuccess'),
  });
});

module.exports = {
  deleteConversation,
  getConversationById,
  getConversationsByUser,
  getMyConversations,
};
