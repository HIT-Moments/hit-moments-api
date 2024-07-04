const httpStatus = require('http-status');

const { i18n } = require('../config');
const { React } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createReaction = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  //#TODO : check post
  const reaction = await React.create({ userId, ...req.body });
  return res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('react.createSuccess'),
    data: {
      reaction,
    },
  });
});

const getReaction = catchAsync(async (req, res, next) => {
  const reactions = await React.findOne({postId : req.params.postId});

  if (!reactions) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('react.notFound')); 
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('react.getSuccess'),
    data: {
      reactions,
    },
  });
});

module.exports = {
  createReaction,
  getReaction,
};
