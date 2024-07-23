const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Moment, Friend } = require('../models');
const { UPLOAD_LOCATION } = require('../constants');
const { frontendUrl } = require('../config/env.config');
const { Moment, TemporaryMoment } = require('../models');
const { ApiError, catchAsync, convertFacebookPosts } = require('../utils');

const createMoment = catchAsync(async (req, res) => {
  const moment = await Moment.create({
    ...req.body,
    userId: req.user.id,
    image: req.file?.path,
  });

  if (!moment.image.startsWith('http')) {
    moment.image = `${frontendUrl}/${req.file?.path.replaceAll('\\', '/').replace('public/', '')}`;
    moment.uploadLocation = UPLOAD_LOCATION.LOCAL;
  }

  await moment.save();

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('moment.createSuccess'),
    data: {
      moment,
    },
  });
});

const getMoments = catchAsync(async (req, res) => {
  const { limit = 10, page = 1, isDeleted = false } = req.query;
  const skip = (+page - 1) * limit;

  const { friendList } = await Friend.findOne({ userId: req.user.id });

  const query = {
    isDeleted,
    userId: { $in: [req.user.id, ...friendList] },
  };

  const [moments, totalMoments] = await Promise.all([
    Moment.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'fullname avatar' })
      .lean(),
    Moment.countDocuments(query),
  ]);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMomentsSuccess'),
    data: {
      moments: transformPopulatedMoments(moments),
      limit: +limit,
      currentPage: +page,
      totalPage: Math.ceil(totalMoments / +limit),
      totalMoments,
    },
  });
});

const getMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findById(momentId).lean().populate({ path: 'userId', select: 'fullname avatar' });

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  const { friendList } = await Friend.findOne({ userId: req.user.id });

  const validUserIds = [req.user.id, ...friendList].map((id) => id.toString());

  if (!validUserIds.includes(moment.userId._id.toString())) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMomentSuccess'),
    data: {
      moment: transformPopulatedMoments([moment])[0],
    },
  });
});

const updateMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (moment.userId.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('moment.updateMomentForbidden'));
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
  const { momentId, isDeletePermanently = false } = req.params;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (moment.userId.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('moment.deleteMomentForbidden'));
  }

  if (isDeletePermanently) {
    await moment.deleteOne();
  } else {
    moment.isDeleted = true;
    moment.deletedAt = new Date();
    await moment.save();
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.deleteMomentSuccess'),
  });
});

const getMyMoments = catchAsync(async (req, res) => {
  const { isDeleted = false } = req.query;

  const moments = await Moment.find({ userId: req.user.id, isDeleted })
    .sort({ createdAt: -1 })
    .populate({ path: 'userId', select: 'fullname avatar' })
    .lean();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMyMomentsSuccess'),
    data: {
      moments: transformPopulatedMoments(moments),
    },
  });
});

const getMomentsByUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('moment.userIdRequired'));
  }

  const { friendList } = await Friend.findOne({ userId: req.user.id });

  if (!friendList.includes(userId) && userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('friend.notFriend'));
  }

  const moments = await Moment.find({ userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate({ path: 'userId', select: 'fullname avatar' })
    .lean();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.getMomentsByUserSuccess'),
    data: {
      moments: transformPopulatedMoments(moments),
    },
  });
});

const restoreMoment = catchAsync(async (req, res) => {
  const { momentId } = req.params;

  const moment = await Moment.findById(momentId);

  if (!moment) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (!moment.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('moment.restoreMomentBadRequest'));
  }

  if (moment.userId.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, i18n.translate('moment.restoreMomentForbidden'));
  }

  moment.isDeleted = false;
  moment.deletedAt = null;
  await moment.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.restoreMomentSuccess'),
    data: {
      moment,
    },
  });
});

const importMoments = catchAsync(async (req, res) => {
  const facebookPosts = await convertFacebookPosts(req.file?.path);

  for (const post of facebookPosts) {
    await TemporaryMoment.create({
      ...post,
      userId: req.user.id,
    });
  }

  const temporaryMoments = await TemporaryMoment.find({ userId: req.user.id });

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.importMomentsSuccess'),
    data: {
      moments: temporaryMoments,
    },
  });
});

const moveMomentToPermanent = catchAsync(async (req, res) => {
  const { momentIds } = req.body;

  const temporaryMoments = await TemporaryMoment.find({ _id: { $in: momentIds }, userId: req.user.id });

  if (temporaryMoments.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (temporaryMoments.length !== momentIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('moment.invalidImportRecordsCount'));
  }

  for (const temporaryMoment of temporaryMoments) {
    await Moment.create({
      ...temporaryMoment.toObject(),
    });

    await temporaryMoment.deleteOne();
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('moment.moveMomentToPermanentSuccess'),
  });
});

const transformPopulatedMoments = (moments) => {
  return moments.map((moment) => {
    const { userId, ...rest } = moment;
    return {
      ...rest,
      user: {
        id: userId._id,
        fullname: userId.fullname,
        avatar: userId.avatar,
      },
    };
  });
};

module.exports = {
  createMoment,
  getMoments,
  getMoment,
  updateMoment,
  deleteMoment,
  getMyMoments,
  getMomentsByUser,
  restoreMoment,
  importMoments,
  moveMomentToPermanent,
};
