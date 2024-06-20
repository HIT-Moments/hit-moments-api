const httpStatus = require('http-status');

const { i18n } = require('../config');
const { User } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createUser = catchAsync(async (req, res) => {
  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('user.emailExists'));
  }

  const user = await User.create(req.body);

  res.status(httpStatus.CREATED).json({
    statusCode: httpStatus.CREATED,
    message: i18n.translate('user.createSuccess'),
    data: {
      user,
    },
  });
});

const getUsers = catchAsync(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (+page - 1) * limit;
  const query = {};
  const users = await User.find().limit(limit).skip(skip);
  const totalUsers = await User.countDocuments(query);

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('user.getUsersSuccess'),
    data: {
      users,
      limit: +limit,
      currentPage: +page,
      totalPage: Math.ceil(totalUsers / +limit),
      totalUsers,
    },
  });
});

const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('user.userNotFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('user.getUserSuccess'),
    data: {
      user,
    },
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
};
