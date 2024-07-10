const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Conversation, User, Friend } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createConversation = catchAsync(async (req, res, next) => {
  const participant1 = req.user._id;
  const { participant2 } = req.body;

  const user = await User.findById(participant2);
    
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('user.userNotFound'));
  }

  const isFriend = await Friend.findOne({ userId: participant2 });

  if(!isFriend || !isFriend.friendList.includes(participant1)) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('friend.notAlreadyFriend'));
  }

  //TODO: check react or commnet
  const conversationExisting = await Conversation.findOne({ participant1: participant1, participant2: participant2 });

  if (conversationExisting) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('conversation.alreadyExist'));
  }

  const conversation = await Conversation.create({ participant1, participant2 });

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('conversation.createSuccess'),
    data: {
      conversation,
    },
  });
});

const getMyConversation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const myConversations = await Conversation.find({
    $expr: {
      $or: [{ $eq: ['$participant1', userId] }, { $eq: ['$participant2', userId] }],
    },
  });

  if (!myConversations) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('conversation.notFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('conversation.getConversationsSuccess'),
    data: {
      myConversations,
    },
  });
});

const getListConversations = catchAsync(async (req, res, next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const conversations = await Conversation.find(query).limit(limit).skip(skip);
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

module.exports = {
  createConversation,
  getMyConversation,
  getListConversations,
  deleteConversation,
};
