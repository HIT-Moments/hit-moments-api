const joi = require('joi');

const { objectId } = require('./custom.validation');

const createFriend = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
  body: joi.object({
    friendList: joi.array(),
    friendRequest: joi.array(),
    blockList: joi.array(),
  }),
};

const searchUserByEmail = {
  body: joi.object({
    email: joi.string().required(),
  }),
};

const sendRequest = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
  body: joi.object({
    receiverId: joi.string().required().custom(objectId),
  }),
};

const listReceivedRequests = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
};

const acceptRequest = {
  body: joi.object({
    requesterId: joi.string().required().custom(objectId),
  }),
};

const delinceRequest = {
  body: joi.object({
    requesterId: joi.string().required().custom(objectId),
  }),
};

const getListFriends = {
  params: joi.object({
    userId: joi.string().custom(objectId),
  }),
};

const deleteFriend = {
  body: joi.object({
    friendId: joi.string().required().custom(objectId),
  }),
};

const blockFriend = {
  body: joi.object({
    friendId: joi.string().required().custom(objectId),
  }),
};

const unblockFriend = {
  body: joi.object({
    friendId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createFriend,
  sendRequest,
  listReceivedRequests,
  deleteFriend,
  acceptRequest,
  delinceRequest,
  getListFriends,
  blockFriend,
  unblockFriend,
  searchUserByEmail,
};
