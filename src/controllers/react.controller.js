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
  const reactions = await React.find({ postId: req.params.postId });

  if (!reactions) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('react.notFound')); //#TODO : add error message key  for not found  post.notFound  or something like that.  for example.  post.notFound = 'Post not found'  in en.json file.   //#TODO : also add error handling for other error cases like database error etc.   //#TODO : consider adding pagination for reactions.  //#TODO : add rate limiting for reactions.  //#TODO : add checks for valid postId.  //#TODO : add checks for valid userId.  //#TODO : add checks for valid reaction type.  //#TODO : add checks for valid reaction value.  //#TODO : add checks for valid reaction timestamp.  //#TODO : add checks for valid reaction comment.  //#TODO : add checks for valid reaction user.  //#TODO :
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
