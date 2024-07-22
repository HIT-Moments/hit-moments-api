const https = require('http-status');
const { i18n } = require('../config');
const { Friend, User } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const getPopulatedFriend = async (userId) => {
  return await Friend.findOne({ userId }).populate('friendList friendRequest blockList');
};

const getExcludedIds = (userId, userFriendsIds, userSentRequestsIds, userReceivedRequestsIds) => {
  return [userId, ...userFriendsIds, ...userSentRequestsIds, ...userReceivedRequestsIds];
};

const fetchMutualFriends = async (userFriendsIds, userId, userSentRequestsIds, userReceivedRequestsIds) => {
  const mutualFriendsCount = {};

  for (const friendId of userFriendsIds) {
    const friend = await Friend.findOne({ userId: friendId }).populate('friendList');
    if (friend) {
      const friendFriendsIds = friend.friendList.map((f) => f._id.toString());
      for (const mutualFriendId of friendFriendsIds) {
        if (
          mutualFriendId !== userId.toString() &&
          !userFriendsIds.includes(mutualFriendId) &&
          !userSentRequestsIds.includes(mutualFriendId) &&
          !userReceivedRequestsIds.includes(mutualFriendId)
        ) {
          mutualFriendsCount[mutualFriendId] = (mutualFriendsCount[mutualFriendId] || 0) + 1;
        }
      }
    }
  }
  return mutualFriendsCount;
};

const fetchSuggestedUsersByMutualFriends = async (suggestions) => {
  const suggestedUserIds = suggestions.map((s) => s.userId);
  return await User.find({ _id: { $in: suggestedUserIds } }).select('fullname email avatar');
};

const fetchRandomUsers = async (excludedIds, size = 20) => {
  return await User.aggregate([
    { $match: { _id: { $nin: excludedIds } } },
    { $sample: { size } },
    { $project: { fullname: 1, email: 1, avatar: 1 } },
  ]);
};

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

  if (!receiver || receiver._id.equals(senderId)) {
    throw new ApiError(
      receiver ? https.BAD_REQUEST : https.NOT_FOUND,
      i18n.translate(receiver ? 'friend.cannotSendRequestToSelf' : 'friend.notFound'),
    );
  }

  let receiverFriend = await getPopulatedFriend(receiverId);
  let senderFriend = await getPopulatedFriend(senderId);

  if (
    receiverFriend.friendList.includes(senderId) ||
    receiverFriend.friendRequest.includes(senderId) ||
    senderFriend.blockList.includes(receiverId)
  ) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyFriend'));
  }

  receiverFriend.friendRequest.push(senderId);
  await receiverFriend.save();
  res.json({ message: i18n.translate('friend.sendRequestSuccess'), statusCode: https.OK, data: {} });
});

const listReceivedRequests = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const friend = await getPopulatedFriend(userId);
  res.json({
    message: i18n.translate('friend.listReceivedRequests'),
    statusCode: https.OK,
    data: { friendRequests: friend.friendRequest, total: friend.friendRequest.length },
  });
});

const acceptRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { requesterId } = req.body;
  let userFriend = await getPopulatedFriend(userId);
  let requesterFriend = await getPopulatedFriend(requesterId);

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
  res.json({ message: i18n.translate('friend.acceptRequestSuccess'), statusCode: https.OK, data: {} });
});

const delinceRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { requesterId } = req.body;
  let userFriend = await getPopulatedFriend(userId);

  if (!userFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const requestIndex = userFriend.friendRequest.indexOf(requesterId);
  if (requestIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.requestNotFound'));
  }

  userFriend.friendRequest.splice(requestIndex, 1);
  await userFriend.save();
  res.json({ message: i18n.translate('friend.declineRequestSuccess'), statusCode: https.OK, data: {} });
});

const getListFriends = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const friend = await Friend.findOne({ userId }).populate('friendList', 'id fullname avatar phoneNumber dob email');
  res.json({
    message: i18n.translate('friend.getListFriends'),
    statusCode: https.OK,
    data: { friendList: friend.friendList, total: friend.friendList.length },
  });
});

const deleteFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;
  let userFriend = await getPopulatedFriend(userId);
  let friendFriend = await getPopulatedFriend(friendId);

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
  res.json({ message: i18n.translate('friend.deleteSuccess'), statusCode: https.OK });
});

const blockFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;
  let userFriend = await getPopulatedFriend(userId);
  let friendFriend = await getPopulatedFriend(friendId);

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
  res.json({ message: i18n.translate('friend.blockSuccess'), statusCode: https.OK, data: {} });
});

const unblockFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { friendId } = req.body;
  let userFriend = await getPopulatedFriend(userId);

  if (!userFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const blockIndex = userFriend.blockList.indexOf(friendId);
  if (blockIndex === -1) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.notBlocked'));
  }

  userFriend.blockList.splice(blockIndex, 1);
  await userFriend.save();
  res.json({ message: i18n.translate('friend.unblockSuccess'), statusCode: https.OK, data: {} });
});

const getListBlock = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const friend = await getPopulatedFriend(userId);
  res.json({
    message: i18n.translate('friend.getListBlockSuccess'),
    statusCode: https.OK,
    data: { blockList: friend.blockList, total: friend.blockList.length },
  });
});

const listSentRequests = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const friends = await Friend.find({ friendRequest: userId });
  const friendIds = friends.map((friend) => friend.userId);
  const users = await User.find({ _id: { $in: friendIds } }).select('id fullname avatar phoneNumber dob email');
  res.json({
    message: i18n.translate('friend.listSentRequestsSuccess'),
    statusCode: https.OK,
    data: { sentRequests: users, total: users.length },
  });
});

const cancelSentRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { receiverId } = req.body;
  let userFriend = await getPopulatedFriend(userId);
  let receiverFriend = await getPopulatedFriend(receiverId);

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
  res.json({ message: i18n.translate('friend.cancelSentRequestSuccess'), statusCode: https.OK, data: {} });
});

const suggestionFriends = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userFriend = await getPopulatedFriend(userId);

  if (!userFriend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const userFriendsIds = userFriend.friendList.map((friend) => friend._id.toString());
  const userSentRequestsIds = await Friend.find({ friendRequest: userId }).distinct('userId');
  const userReceivedRequestsIds = userFriend.friendRequest.map((request) => request._id.toString());

  const mutualFriendsCount = await fetchMutualFriends(
    userFriendsIds,
    userId,
    userSentRequestsIds,
    userReceivedRequestsIds,
  );

  const suggestions = Object.keys(mutualFriendsCount).map((key) => ({
    userId: key,
    mutualFriends: mutualFriendsCount[key],
  }));

  suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);

  const suggestedUsersByMutualFriends = await fetchSuggestedUsersByMutualFriends(suggestions);

  const excludedIds = getExcludedIds(userId, userFriendsIds, userSentRequestsIds, userReceivedRequestsIds);
  const randomUsers = await fetchRandomUsers(excludedIds);

  const suggestedUsers =
    suggestedUsersByMutualFriends.length >= 15
      ? suggestedUsersByMutualFriends.slice(0, 20)
      : [...suggestedUsersByMutualFriends, ...randomUsers.slice(0, 20 - suggestedUsersByMutualFriends.length)];

  res.json({
    statusCode: https.OK,
    message: i18n.translate('friend.suggestFriendsSuccess'),
    data: { suggestedUsers, total: suggestedUsers.length },
  });
});

module.exports = {
  searchUserByEmail,
  sendRequest,
  listReceivedRequests,
  acceptRequest,
  delinceRequest,
  getListFriends,
  deleteFriend,
  blockFriend,
  unblockFriend,
  getListBlock,
  listSentRequests,
  cancelSentRequest,
  suggestionFriends,
};
