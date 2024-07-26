const joi = require('joi');

const { objectId } = require('./custom.validation');

const searchUser = {
  query: joi.object({
    search: joi.string(),
    limit: joi.number().integer(),
    page: joi.number().integer(),
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
  searchUser,
  cancelSentRequest,
};
