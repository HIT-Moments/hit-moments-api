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
}

const sendRequest = {
  params: joi.object({
    userId: joi.string().required().custom(objectId),
  }),
  body : joi.object({
    email : joi.string().required(),
  }) 
}

const listReceivedRequests = {
  params: joi.object({
    userId: joi.string().required().custom(objectId),
  }),
};

const getList = {
  query: joi.object({
    friendId: joi.string().required().custom(objectId),
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

const deleteFriend = {
  params: joi.object({
    friendId: joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createFriend,
  sendRequest,
  listReceivedRequests,
  getList,
  deleteFriend,
};
