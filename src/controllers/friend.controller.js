const https = require('http-status');

const { i18n } = require('../config');
const { ApiError, catchAsync } = require('../utils');
const { Friend , User} = require('../models');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createFriend = catchAsync(async(req , res , next) => {
  const userId = req.user._id;
  const friend = await Friend.create({userId});

  return res.status(https.CREATED).json({
    message: i18n.translate('friend.createSuccess'),
    statusCode: https.CREATED,
    data: {
      friend,
    },
  })
})

const sendRequest = catchAsync(async (req ,res) => {
  const senderId = req.user._id;
  const {email} = req.body;
 
  const receiver = await User.findOne({email});

  if(!receiver) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }

  const {friendList , friendRequest , blockList} = await Friend.findOne({userId : senderId})

  if(friendList.includes(receiver._id)){
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyFriend'));
  }

  if(friendRequest.includes(receiver._id)){
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyRequest'));
  }

  if(blockList.includes(receiver._id)){
    throw new ApiError(https.BAD_REQUEST, i18n.translate('friend.alreadyBlock'));
  }

  friendRequest.push(receiver._id);
  await Friend.findOneAndUpdate({userId : senderId}, { friendRequest });

  res.json({
    message: i18n.translate('friend.sendRequestSuccess'),
    statusCode: https.OK,
    data: {},
  })

});

const listReceivedRequests = catchAsync(async (req, res, next) => {
  const userId  = req.params.userId;
  const friend = await Friend.findById(userId).populate('friendRequest', 'username email');
  if (!friend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }
  res.json({
    message: i18n.translate('friend.listReceivedRequests'),
    statusCode: https.OK,
    data: {
      friend,
    },
  });
});

const getList = catchAsync(async (req, res, next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const friends = await Friend.find().limit(limit).skip(skip);
  const totalResults = await Friend.countDocuments(query);
  res.json({
    message: i18n.translate('friend.getList'),
    statusCode: https.OK,
    data: {
      friends,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const deleteFriend = catchAsync(async (req, res, next) => {
  const friend = await Friend.findByIdAndDelete(req.params.userId);
  if (!friend) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('friend.notFound'));
  }
  res.json({
    message: i18n.translate('friend.deleteSuccess'),
    statusCode: https.OK,
  });
});


module.exports = {
  createFriend,
  sendRequest,
  getList,
  deleteFriend,
  listReceivedRequests,
};
