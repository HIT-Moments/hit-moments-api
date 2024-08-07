const https = require('http-status');

const { i18n } = require('../config');
const { Friend, User, Conversation, Message } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { cache } = require('../services');
const { PAGE_DEFAULT, LIMIT_DEFAULT } = require('../constants');

const searchUser = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', search = '' } = req.query;

  const skip = (+page - 1) * limit;

  const [field, value] = sortBy.split(':');
  const sort = { [field.trim()]: value.trim() === 'asc' ? 1 : -1 };

  const query = { isLocked: false };

  const regex = new RegExp(search.trim(), 'i');
  query.$or = [{ fullname: regex }, { email: regex }];

  const [users, totalResults] = await Promise.all([
    User.find(query).select('_id fullname email avatar').limit(+limit).skip(skip).sort(sort),

    User.countDocuments(query),
  ]);

  res.status(https.OK).json({
    statusCode: https.OK,
    message: i18n.translate('user.getUsersSuccess'),
    data: {
      users,
      limit: +limit,
      currentPage: +page,
      totalPage: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const sendRequest = catchAsync(async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  if (receiver._id.equals(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.cannotSendRequestToSelf'));
  }

  const [receiverFriend, senderFriend] = await Promise.all([
    Friend.findOne({ userId: receiverId }),
    Friend.findOne({ userId: senderId }),
  ]);

  if (receiverFriend.friendList.includes(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyFriend'));
  }

  if (receiverFriend.friendRequest.includes(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyRequest'));
  }

  if (senderFriend.blockList.includes(receiverId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyBlock'));
  }

  receiverFriend.friendRequest.push(senderId);
  await receiverFriend.save();

  const receiverCacheKey = `suggestionFriends:${receiverId}`;
  await cache.del(receiverCacheKey);

  res.json({
    message: i18n.translate('friend.sendRequestSuccess'),
    statusCode: https.OK,
    data: {},
  });
});

const listReceivedRequests = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friend = await Friend.findOne({ userId })
    .populate('friendRequest', 'email fullname avatar')
    .limit(limit)
    .skip(skip);

  const friendRequests = friend.friendRequest;

  res.json({
    message: i18n.translate('friend.listReceivedRequests'),
    statusCode: https.OK,
    data: {
      friendRequests,
      total: friendRequests.length,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(friendRequests.length / +limit),
    },
  });
});

const acceptRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { requesterId } = req.body;

  const [userFriend, requesterFriend] = await Promise.all([
    Friend.findOne({ userId }),
    Friend.findOne({ userId: requesterId }),
  ]);

  if (!userFriend || !requesterFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const requestIndex = userFriend.friendRequest.findIndex((request) => request._id.toString() === requesterId);

  if (requestIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.requestNotFound'));
  }

  userFriend.friendRequest.splice(requestIndex, 1);
  userFriend.friendList.push(requesterId);
  requesterFriend.friendList.push(userId);

  await Promise.all([userFriend.save(), requesterFriend.save()]);

  const conversationExisting = await Conversation.findOne({
    participants: { $all: [userId, requesterId], $size: 2 },
  });

  let conversationId;

  if (!conversationExisting) {
    const newConversation = new Conversation({
      participants: [userId, requesterId],
    });
    await newConversation.save();
    conversationId = newConversation._id;
  } else {
    conversationId = conversationExisting._id;
  }

  const userCacheKey = `suggestionFriends:${userId}`;
  const requestCacheKey = `suggestionFriends:${requesterId}`;

  await Promise.all([
    cache.del(userCacheKey),
    cache.del(requestCacheKey)
  ]);

  res.json({
    message: i18n.translate('friend.acceptRequestSuccess'),
    statusCode: https.OK,
    data: {
      conversationId,
    },
  });
});

const delinceRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { requesterId } = req.body;

  let userFriend = await Friend.findOne({ userId });

  if (!userFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const requestIndex = userFriend.friendRequest.indexOf(requesterId);
  if (requestIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.requestNotFound'));
  }

  userFriend.friendRequest.splice(requestIndex, 1);
  await userFriend.save();

  res.json({
    message: i18n.translate('friend.declineRequestSuccess'),
    statusCode: https.OK,
    data: {},
  });
});

const getListFriends = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friend = await Friend.findOne({ userId }).populate([
    {
      path: 'friendList',
      select: 'id fullname avatar phoneNumber dob email',
      options: {
        limit: limit,
        skip: skip,
      },
    },
  ]);

  const { friendList = [] } = friend;

  const friendListWithConversations = await Promise.all(
    friend.friendList.map(async (friend) => {
      const conversation = await Conversation.findOne({
        $or: [{ participants: [userId, friend._id] }, { participants: [friend._id, userId] }],
      }).select('_id');

      return {
        ...friend.toObject(),
        conversationId: conversation ? conversation._id : null,
      };
    }),
  );

  res.json({
    message: i18n.translate('friend.getListFriends'),
    statusCode: https.OK,
    data: {
      friendList: friendListWithConversations,
      total: friendList.length,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(friendList.length / +limit),
    },
  });
});

const deleteFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  let userFriend = await Friend.findOne({ userId });
  let friendFriend = await Friend.findOne({ userId: friendId });

  if (!userFriend || !friendFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const userFriendIndex = userFriend.friendList.indexOf(friendId);
  const friendFriendIndex = friendFriend.friendList.indexOf(userId);

  if (userFriendIndex === -1 || friendFriendIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.notInList'));
  }

  userFriend.friendList.splice(userFriendIndex, 1);
  friendFriend.friendList.splice(friendFriendIndex, 1);

  await userFriend.save();
  await friendFriend.save();

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, friendId] },
  });

  if (conversation) {
    await Message.deleteMany({ conversationId: conversation._id });
  }

  res.json({
    message: i18n.translate('friend.deleteSuccess'),
    statusCode: https.OK,
  });
});

const blockFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  const userFriend = await Friend.findOne({ userId });
  const friendFriend = await Friend.findOne({ userId: friendId });

  if (!userFriend || !friendFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const userFriendIndex = userFriend.friendList.indexOf(friendId);
  if (userFriendIndex !== -1) {
    userFriend.friendList.splice(userFriendIndex, 1);
  }

  const friendFriendIndex = friendFriend.friendList.indexOf(userId);

  if (friendFriendIndex !== -1) {
    friendFriend.friendList.splice(friendFriendIndex, 1);
  } else {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.notInList'));
  }

  if (!userFriend.blockList.includes(friendId)) {
    userFriend.blockList.push(friendId);
  }

  await userFriend.save();
  await friendFriend.save();

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, friendId] },
  });

  if (conversation) {
    await Message.deleteMany({ conversationId: conversation._id });
  }

  res.json({
    message: i18n.translate('friend.blockSuccess'),
    statusCode: https.OK,
    data: {},
  });
});

const unblockFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  const userFriend = await Friend.findOne({ userId });

  if (!userFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const blockIndex = userFriend.blockList.indexOf(friendId);

  if (blockIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.notBlocked'));
  }

  userFriend.blockList.splice(blockIndex, 1);

  await userFriend.save();

  res.json({
    message: i18n.translate('friend.unblockSuccess'),
    statusCode: https.OK,
    data: {},
  });
});

const getListBlock = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friend = await Friend.findOne({ userId })
    .populate('blockList', 'email fullname avatar')
    .limit(limit)
    .skip(skip);

  const { blockList = [] } = friend;

  res.json({
    message: i18n.translate('friend.getListBlockSuccess'),
    statusCode: https.OK,
    data: {
      blockList,
      total: blockList.length,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(blockList.length / +limit),
    },
  });
});

const listSentRequests = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friends = await Friend.find({ friendRequest: userId });

  const friendIds = friends.map((friend) => friend.userId);

  const users = await User.find({ _id: { $in: friendIds } })
    .select('id fullname avatar phoneNumber dob email')
    .skip(skip)
    .limit(limit);

  res.json({
    message: i18n.translate('friend.listSentRequestsSuccess'),
    statusCode: https.OK,
    data: {
      sentRequests: users,
      total: users.length,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(users.length / +limit),
    },
  });
});

const cancelSentRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { receiverId } = req.body;

  let userFriend = await Friend.findOne({ userId });
  let receiverFriend = await Friend.findOne({ userId: receiverId });

  if (!userFriend || !receiverFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const receivedRequestIndex = receiverFriend.friendRequest.indexOf(userId);

  if (receivedRequestIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.requestNotFound'));
  }

  receiverFriend.friendRequest.splice(receivedRequestIndex, 1);

  await userFriend.save();
  await receiverFriend.save();

  res.json({
    message: i18n.translate('friend.cancelSentRequestSuccess'),
    statusCode: https.OK,
    data: {},
  });
});

const suggestionFriends = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;
  const skip = (+page - 1) * limit;
  
  const cacheKey = `suggestionFriends:${userId}:${page}:${limit}`;
  const cachedSuggestions = await cache.get(cacheKey);

  if (cachedSuggestions) {
    return res.json({
      statusCode: https.OK,
      message: i18n.translate('friend.suggestFriendsSuccess'),
      data: JSON.parse(cachedSuggestions),
    });
  }

  const userFriend = await Friend.findOne({ userId }).populate('friendList friendRequest blockList');
  
  const userFriendsIds = userFriend.friendList.map(friend => friend._id.toString());
  const userSentRequestsIds = await Friend.find({ friendRequest: userId }).distinct('userId');
  const userReceivedRequestsIds = userFriend.friendRequest.map(request => request._id.toString());
  const userBlockListIds = userFriend.blockList.map(block => block._id.toString());
  
  const friendsPromises = userFriendsIds.map(friendId => Friend.findOne({ userId: friendId }).populate('friendList'));
  const friends = await Promise.all(friendsPromises);

  const mutualFriendsCount = {};

  friends.forEach(friend => {
    if (friend) {
      const friendFriendsIds = friend.friendList.map(f => f._id.toString());
      friendFriendsIds.forEach(mutualFriendId => {
        if (
          mutualFriendId !== userId.toString() &&
          !userFriendsIds.includes(mutualFriendId) &&
          !userSentRequestsIds.includes(mutualFriendId) &&
          !userReceivedRequestsIds.includes(mutualFriendId) &&
          !userBlockListIds.includes(mutualFriendId)
        ) {
          mutualFriendsCount[mutualFriendId] = (mutualFriendsCount[mutualFriendId] || 0) + 1;
        }
      });
    }
  });

  const suggestions = Object.keys(mutualFriendsCount).map(key => ({
    userId: key,
    mutualFriends: mutualFriendsCount[key],
  }));

  suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);

  const suggestedUserIds = suggestions.map(s => s.userId);
  const totalSuggestedUsers = suggestedUserIds.length;

  const suggestedUsersByMutualFriends = await User.find({ _id: { $in: suggestedUserIds.slice(skip, skip + limit) } }).select('fullname email avatar');

  const excludedIds = [
    userId,
    ...userFriendsIds,
    ...userSentRequestsIds,
    ...userReceivedRequestsIds,
    ...userBlockListIds,
  ];

  let randomUsers = [];
  if (suggestedUsersByMutualFriends.length < limit) {
    const neededRandomUsers = limit - suggestedUsersByMutualFriends.length;
    randomUsers = await User.aggregate([
      { $match: { _id: { $nin: excludedIds } } },
      { $sample: { size: neededRandomUsers } },
      { $project: { fullname: 1, email: 1, avatar: 1 } },
    ]);
  }

  const suggestedUsers = [...suggestedUsersByMutualFriends, ...randomUsers];

  const result = {
    suggestedUsers,
    total: totalSuggestedUsers,
    page: +page,
    limit: +limit,
    totalPages: Math.ceil(totalSuggestedUsers / +limit),
  };

  res.status(https.OK).json({
    statusCode: https.OK,
    message: i18n.translate('friend.suggestFriendsSuccess'),
    data: result,
  });
});

module.exports = {
  sendRequest,
  deleteFriend,
  listReceivedRequests,
  acceptRequest,
  delinceRequest,
  getListFriends,
  blockFriend,
  unblockFriend,
  getListBlock,
  searchUser,
  listSentRequests,
  cancelSentRequest,
  suggestionFriends,
};
