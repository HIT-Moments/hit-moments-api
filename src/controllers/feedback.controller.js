const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Feedback } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createFeedback = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const userId = '662cf6c351d7d3424baea277';
  const image = req.file?.path;

  const feedback = await Feedback.create({ userId, content, image });

  res.status(httpStatus.CREATED).json({
    message: i18n.translate('feedback.createSuccess'),
    statusCode: httpStatus.OK,
    data: {
      feedback,
    },
  });
});

const getFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.feedbackId);

  if (!feedback) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('feedback.notFound'));
  }

  res.status(httpStatus.OK).json({
    message: i18n.translate('feedback.getFeedback'),
    statusCode: httpStatus.OK,
    data: {
      feedback,
    },
  });
});

const getallFeedback = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, sortBy = 'createdAt : desc' } = req.query;

  const skip = (+page - 1) * +limit;

  const [field, value] = sortBy.split(':');
  const sort = { [field]: value === 'asc' ? 1 : -1 };

  const query = {};

  const feedbacks = await Feedback.find().limit(limit).skip(skip).sort(sort);

  const totalResults = await Feedback.countDocuments(query);

  res.status(httpStatus.OK).json({
    message: i18n.translate('feedback.getDetail'),
    statusCode: httpStatus.OK,
    data: {
      feedbacks,
      limit: +limit,
      currarentPage: +page,
      totalPage: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const updateFeedbackById = catchAsync(async (req, res, next) => {
  const updateBody = req.body;

  const feedback = await Feedback.findById(req.params.feedbackId);

  if (!feedback) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('feedback.notFound'));
  }

  Object.assign(feedback, updateBody);

  if (req.file) {
    feedback.image = req.file.path;
  }

  await feedback.save();

  res.status(httpStatus.OK).json({
    message: i18n.translate('feedback.updateSuccess'),
    statusCode: httpStatus.OK,
    data: {
      feedback,
    },
  });
});

const deleteFeedbackById = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.feedbackId);

  if (!feedback) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('feedback.notFound'));
  }

  res.status(httpStatus.OK).json({
    message: i18n.translate('feedback.deleteSuccess'),
    statusCode: httpStatus.OK,
    data: {
      feedback,
    },
  });
});

module.exports = {
  createFeedback,
  getallFeedback,
  updateFeedbackById,
  getFeedback,
  deleteFeedbackById,
};
