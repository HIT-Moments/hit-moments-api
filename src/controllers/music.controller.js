const httpStatus = require('http-status');

const { i18n } = require('../config');
const { Music } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createMusic = catchAsync(async (req, res, next) => {
  const link = req.file?.path;

  const music = await Music.create({ ...req.body, link });

  res.status(httpStatus.CREATED).json({
    message: i18n.translate('music.createSuccess'),
    statusCode: httpStatus.CREATED,
    data: {
      music,
    },
  });
});

const getMusicById = catchAsync(async (req, res, next) => {
  const music = await Music.findOne({ _id: req.params.musicId, isDelete: false });

  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('music.notFound'));
  }

  res.status(httpStatus.OK).json({
    message: i18n.translate('music.getSuccess'),
    statusCode: httpStatus.OK,
    data: {
      music,
    },
  });
});

const searchMusic = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', search = '' } = req.query;

  const skip = (+page - 1) * +limit;

  const [field, value] = sortBy.split(':');
  const sort = { [field.trim()]: value.trim() === 'asc' ? 1 : -1 };

  const query = { isDelete: false };

  const regex = new RegExp(search.trim(), 'i');
  query.$or = [{ name: regex }, { author: regex }];

  const [music, totalResults] = await Promise.all([
    Music.find(query).limit(+limit).skip(skip).sort(sort),
    Music.countDocuments(query),
  ]);

  res.status(httpStatus.OK).json({
    message: music.length > 0 ? i18n.translate('music.getSuccess') : i18n.translate('music.notFound'),
    statusCode: httpStatus.OK,
    data: {
      music,
      limit: +limit,
      currentPage: +page,
      totalPage: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const updateMusicById = catchAsync(async (req, res, next) => {
  const updateBody = req.body;

  if (!updateBody) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('music.updateBodyRequired'));
  }

  const music = await Music.findOne({ _id: req.params.musicId, isDelete: false });

  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('music.notFound'));
  }

  Object.assign(music, updateBody);

  if (req.file && req.file.path) {
    music.link = req.file.path;
  }

  await music.save();

  res.status(httpStatus.OK).json({
    message: i18n.translate('music.updateSuccess'),
    statusCode: httpStatus.OK,
    data: {
      music,
    },
  });
});

const deleteMusicById = catchAsync(async (req, res, next) => {
  const music = await Music.findOne({ _id: req.params.musicId, isDelete: false });

  if (!music) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('music.notFound'));
  }

  music.isDelete = true;

  await music.save();

  res.status(httpStatus.OK).json({
    message: i18n.translate('music.deleteSuccess'),
    statusCode: httpStatus.OK,
    data: {
      music,
    },
  });
});

module.exports = {
  createMusic,
  searchMusic,
  updateMusicById,
  getMusicById,
  deleteMusicById,
};
