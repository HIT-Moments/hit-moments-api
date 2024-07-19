const joi = require('joi');

const { objectId } = require('./custom.validation');

const searchUserByEmail = {
  query: joi.object({
    email: joi.string().required(),
  }),
};

const sendRequest = {
  body: joi.object({
    receiverId: joi.string().required().custom(objectId),
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

const cancelSentRequest = {
  body: joi.object({
    receiverId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  sendRequest,
  deleteFriend,
  acceptRequest,
  delinceRequest,
  getListFriends,
  blockFriend,
  unblockFriend,
  searchUserByEmail,
  cancelSentRequest,
};
