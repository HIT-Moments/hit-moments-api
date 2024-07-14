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
  const music = await Music.findOne({_id: req.params.musicId, isDelete: false});

  if(!music) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('music.notFound'));
  }

  res.status(httpStatus.OK).json({
    message: i18n.translate('music.getSuccess'),
    statusCode: httpStatus.OK,
    data: {
      music,
    }
  });
});

const searchMusic = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, sortBy = 'createdAt : desc' } = req.query;

  const skip = (+page - 1) * +limit;

  const [field, value] = sortBy.split(':');
  const sort = { [field]: value === 'asc' ? 1 : -1 };

  const query = { isDelete: false };

  const music = await Music.find({ ...req.body, isDelete: false }).limit(limit).skip(skip).sort(sort);

  const totalResults = await Music.countDocuments(query);

  if (music.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('music.notFound'));
  }

  res.status(httpStatus.OK).json({
    message: i18n.translate('music.getSuccess'),
    statusCode: httpStatus.OK,
    data: {
      music,
      limit: +limit,
      currarentPage: +page,
      totalPage: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const updateMusicById = catchAsync(async (req, res, next) => {
  const updateBody  = req.body;

  if (!updateBody) {
    throw new ApiError(httpStatus.BAD_REQUEST, i18n.translate('music.updateBodyRequired'));
  }

  const music = await Music.findOne({_id: req.params.musicId, isDelete: false});

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

const deleteMusicById = catchAsync(async (req, res, next) =>{
  const music = await Music.findOne({ _id: req.params.musicId, isDelete: false});

  if(!music) {
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
