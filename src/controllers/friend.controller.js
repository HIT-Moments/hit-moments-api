const https = require('http-status');

const { i18n } = require('../config');
const { Friend, User } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { cache } = require('../services');
const { PAGE_DEFAULT, LIMIT_DEFAULT } = require('../constants');

const searchUserByEmail = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  const user = await User.findOne({ email }).select('id fullname avatar phoneNumber dob email');

  res.json({
    message: i18n.translate('user.getUserSuccess'),
    statusCode: https.OK,
    data: { user: user || [] },
  });
});

const sendRequest = catchAsync(async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  const receiver = await User.findById(receiverId);

  if (receiver._id.equals(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.cannotSendRequestToSelf'));
  }

  if (!receiver) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  let receiverFriend = await Friend.findOne({ userId: receiverId });
  let senderFriend = await Friend.findOne({ userId: senderId });

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

  let userFriend = await Friend.findOne({ userId });
  let requesterFriend = await Friend.findOne({ userId: requesterId });

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

  await userFriend.save();
  await requesterFriend.save();

  res.json({
    message: i18n.translate('friend.acceptRequestSuccess'),
    statusCode: https.OK,
    data: {},
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
  res.json({
    message: i18n.translate('friend.getListFriends'),
    statusCode: https.OK,
    data: {
      friendList,
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

  const cacheKey = `suggestionFriends:${userId}`;
  const cachedSuggestions = await cache.get(cacheKey);

  if (cachedSuggestions) {
    return res.json({
      statusCode: https.OK,
      message: i18n.translate('friend.suggestFriendsSuccess'),
      data: cachedSuggestions,
    });
  }

  const userFriend = await Friend.findOne({ userId }).populate('friendList friendRequest blockList');

  const userFriendsIds = userFriend.friendList.map((friend) => friend._id.toString());
  const userSentRequestsIds = await Friend.find({ friendRequest: userId }).distinct('userId');
  const userReceivedRequestsIds = userFriend.friendRequest.map((request) => request._id.toString());

  const friendsPromises = userFriendsIds.map((friendId) => Friend.findOne({ userId: friendId }).populate('friendList'));

  const friends = await Promise.all(friendsPromises);

  const mutualFriendsCount = {};

  friends.forEach((friend) => {
    if (friend) {
      const friendFriendsIds = friend.friendList.map((f) => f._id.toString());
      friendFriendsIds.forEach((mutualFriendId) => {
        if (
          mutualFriendId !== userId.toString() &&
          !userFriendsIds.includes(mutualFriendId) &&
          !userSentRequestsIds.includes(mutualFriendId) &&
          !userReceivedRequestsIds.includes(mutualFriendId)
        ) {
          mutualFriendsCount[mutualFriendId] = (mutualFriendsCount[mutualFriendId] || 0) + 1;
        }
      });
    }
  });

  const suggestions = Object.keys(mutualFriendsCount).map((key) => ({
    userId: key,
    mutualFriends: mutualFriendsCount[key],
  }));

  suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);

  const suggestedUserIds = suggestions.map((s) => s.userId);
  const suggestedUsersByMutualFriends = await User.find({ _id: { $in: suggestedUserIds } }).select(
    'fullname email avatar',
  );

  const excludedIds = [userId, ...userFriendsIds, ...userSentRequestsIds, ...userReceivedRequestsIds];

  const randomUsers = await User.aggregate([
    { $match: { _id: { $nin: excludedIds } } },
    { $sample: { size: 20 } },
    { $project: { fullname: 1, email: 1, avatar: 1 } },
  ]);

  let suggestedUsers;

  if (suggestedUsersByMutualFriends.length >= 15) {
    suggestedUsers = suggestedUsersByMutualFriends.slice(0, 20);
  } else {
    const neededRandomUsers = 20 - suggestedUsersByMutualFriends.length;
    suggestedUsers = [...suggestedUsersByMutualFriends, ...randomUsers.slice(0, neededRandomUsers)];
  }

  const result = {
    suggestedUsers,
    total: suggestedUsers.length,
  };

  cache.set(cacheKey, result, { ttl: 10800 });

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
  searchUserByEmail,
  listSentRequests,
  cancelSentRequest,
  suggestionFriends,
};
