const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Moment } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createMoment = catchAsync(async (req, res) => {
  const moment = await Moment.create({
    ...req.body,
    userId: req.user.id,
    image: req.file?.path,
  });

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('moment.createSuccess'),
    data: {
      moment,
    },
  });
});

const getMoments = catchAsync(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (+page - 1) * limit;
  const query = {};
  const moments = await Moment.find().limit(limit).skip(skip);
  const totalMoments = await Moment.countDocuments(query);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMomentsSuccess'),
    data: {
      moments,
      limit: +limit,
      currentPage: +page,
      totalPage: Math.ceil(totalMoments / +limit),
      totalMoments,
    },
  });
});

const getMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMomentSuccess'),
    data: {
      moment,
    },
  });
});

const updateMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  Object.assign(moment, req.body);
  await moment.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.updateMomentSuccess'),
    data: {
      moment,
    },
  });
});

const deleteMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findByIdAndDelete(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.deleteMomentSuccess'),
  });
});

module.exports = {
  createMoment,
  getMoments,
  getMoment,
  updateMoment,
  deleteMoment,
};