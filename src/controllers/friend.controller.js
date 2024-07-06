const https = require('http-status');

const { i18n } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { Friend, User } = require('../models');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createFriend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const friend = await Friend.create({ userId });

  return res.status(https.CREATED).json({
    message: i18n.translate('friend.createSuccess'),
    statusCode: https.CREATED,
    data: { friend },
  });
});

const searchUserByEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('user.notFound'));
  }

  res.json({
    message: i18n.translate('user.getUsersSuccess'),
    statusCode: https.OK,
    data: { user },
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

  let receiverFriend = await Friend.findOne({ userId: receiver._id });

  if (receiverFriend.friendList.includes(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyFriend'));
  }

  if (receiverFriend.friendRequest.includes(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyRequest'));
  }

  if (receiverFriend.blockList.includes(senderId)) {
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyBlocked'));
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
  const friend = await Friend.findOne({ userId }).populate('friendRequest', 'username email fullname avatatr');

  if (!friend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const friendRequests = friend.friendRequest;

  res.json({
    message: i18n.translate('rateLimit.listReceivedRequests'),
    statusCode: https.OK,
    data: { friendRequests },
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
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const userId = req.user._id;
  const friend = await Friend.findOne({ userId })
    .limit(limit)
    .skip(skip)
    .populate('friendList', 'username email fullname avatar');

  if (!friend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const listFriends = friend.friendList;
  const totaFriends = friend.friendList.length;
  res.json({
    message: i18n.translate('rateLimit.listReceivedRequests'),
    statusCode: https.OK,
    data: {
      listFriends,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(totaFriends / +limit),
      totaFriends,
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
  }

  userFriend.blockList.push(friendId);

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
  const friend = await Friend.findOne({ userId }).populate('blockList', 'username email fullname avatar');

  if (!friend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const listBlock = friend.blockList;

  res.json({
    message: i18n.translate('friend.getListBlockSuccess'),
    statusCode: https.OK,
    data: {
      listBlock,
    },
  });
});

module.exports = {
  createFriend,
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
};
