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
  const reaction = await React.findOne({ userId, momentId });
  if (reaction) {
    reaction.reacts.push(react);
    await reaction.save();
  } else {
    reaction = await React.create({ userId, ...req.body });
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

module.exports = {
  sendReaction,
  getReaction,
};
