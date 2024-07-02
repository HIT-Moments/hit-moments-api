const joi = require('joi');

const { objectId } = require('./custom.validation');

const createFriend = {
  body: joi.object({
    userId: joi.string().required().custom(objectId),
    friendList: joi.array(),
    friendRequest: joi.array(),
    blockList: joi.array(),
  }),
};

const getDetail = {
  params: joi.object({
    friendId: joi.string().required().custom(objectId),
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
  getDetail,
  getList,
  deleteFriend,
};
