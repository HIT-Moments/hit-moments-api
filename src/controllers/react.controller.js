const httpStatus = require('http-status');

const { i18n } = require('../config');
const { React, Moment } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const sendReaction = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { momentId, react } = req.body;
  const momentExisting = await Moment.findById(momentId);

  if (!momentExisting) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (momentExisting.userId.toString() === userId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('react.cannotReactToOwnMoment'));
  }

  let reaction = await React.findOne({ userId, momentId });

  if (reaction) {
    reaction.reacts.push(react);
    await reaction.save();
  } else {
    reaction = await React.create({ userId, momentId, reacts: [react] });
  }

  return res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('react.createSuccess'),
    data: {
      reaction,
    },
  });
});

const getReaction = catchAsync(async (req, res, next) => {
  const { momentId } = req.params;

  const userId = req.user._id;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (moment.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('auth.forbidden'));
  }

  const reactions = await React.find({ momentId }).populate('userId', 'fullname avatar').sort({ reacts: 1 });

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

const getUserReactions = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { momentId } = req.params;

  const momentExisting = await Moment.findById(momentId);

  if (!momentExisting) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('moment.momentNotFound'));
  }

  const reactions = await React.find({ userId, momentId }).populate('reacts', 'userId');

  const reactionDetails = reactions.map((reaction) => ({
    momentId: reaction.momentId._id,
    reacts: reaction.reacts || [],
  }));

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('react.getAllSuccess'),
    data: {
      reactions: reactionDetails,
    },
  });
});

module.exports = {
  sendReaction,
  getReaction,
  getUserReactions,
};
