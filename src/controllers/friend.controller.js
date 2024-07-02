const https = require('http-status');

const { i18n } = require('../config');
const {ApiError , catchAsync} = require('../utils');
const { Friend ,User } = require('../models');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createFriend = catchAsync(async (req, res, next) => {
  const userId = User._id;
  req.body.userId = userId;
  const friend = await Friend.create(req.body);
  return res.status(https.CREATED).json({
    message : i18n.translate('friend.createSuccess'),
    statusCode : https.CREATED,
    data : {
        friend,
    }
  })
});

const getDetail = catchAsync(async (req, res , next) => {
  const friend = await Friend.findById(req.params.friendId);
  if(!friend){
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }
  res.json({
    message : i18n.translate('friend.getDetail'),
    statusCode : https.OK,
    data : {
        friend,
    }
  })
});

const getList = catchAsync(async (req, res , next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friends = await Friend.find().limit(limit).skip(skip);
  const totalResults = await Friend.countDocuments(query);
  res.json({
    message : i18n.translate('friend.getList'),
    statusCode : https.OK,
      data : {
      friends,
      page : +page,
      limit : +limit,
      totalPages : Math.ceil(totalResults / +limit),
      totalResults,
     }
    })
});

const deleteFriend = catchAsync(async (req, res , next) => {
    const friend = await Friend.findByIdAndDelete(req.params.userId);
    if(!friend){
        throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
    }
    res.json({
        message : i18n.translate('friend.deleteSuccess'),
        statusCode : https.OK,
    })
});

module.exports = {
    createFriend,
    getDetail,
    getList,
    deleteFriend,
}
