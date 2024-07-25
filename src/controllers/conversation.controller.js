const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Conversation, User } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const getMyConversation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const myConversations = await Conversation.find({ participants: userId })
    .populate('participants', 'fullname avatar')
    .populate({
      path: 'messages',
      select: 'text createdAt',
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

  if (!myConversations) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  const result = myConversations.map((conversation) => {
    const user = conversation.participants.find((participant) => !participant._id.equals(userId));
    return {
      _id: conversation._id,
      user,
      lastMessage: conversation.messages[0] || [],
    };
  });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationsSuccess'),
    data: {
      myConversations: result,
    },
  });
});

const getListConversations = catchAsync(async (req, res, next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const conversations = await Conversation.find(query)
    .limit(limit)
    .skip(skip)
    .populate('participants', 'fullname avatar')
    .select('participants');

  const totalConversations = await Conversation.countDocuments(query);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getListConversationsSuccess'),
    data: {
      conversations,
      limit: +limit,
      currarentPage: +page,
      totalPage: Math.ceil(totalConversations / +limit),
      totalConversations,
    },
  });
});

const deleteConversation = catchAsync(async (req, res, next) => {
  const conversationId = req.params.conversationId;

  const conversation = await Conversation.findByIdAndDelete(conversationId);
  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  res.json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.deleteSuccess'),
  });
});

const getListConversationById = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  let conversation = await Conversation.findById(conversationId).populate({
    path: 'messages',
    select: 'senderId text',
    populate: {
      path: 'senderId',
      select: 'fullname avatar',
    },
  });

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationByIdSuccess'),
    data: {
      conversation,
    },
  });
});

module.exports = {
  getMyConversation,
  getListConversations,
  deleteConversation,
  getListConversationById,
};
