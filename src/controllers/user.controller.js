const httpStatus = require('http-status');

const { i18n } = require('../config');
const { User } = require('../models');
const { ApiError, catchAsync, formatEmail } = require('../utils');

const createUser = catchAsync(async (req, res) => {
  const { email } = req.body;

  const existingEmail = await User.findOne({ formattedEmail: formatEmail(email) });

  if (existingEmail) {
    throw new ApiError(httpStatus.CONFLICT, i18n.translate('user.emailExists'));
  }

  const user = await User.create({ ...req.body, formattedEmail: formatEmail(email) });

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

const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('user.userNotFound'));
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('user.updateSuccess'),
    data: {
      user,
    },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, i18n.translate('user.userNotFound'));
  }

  res.status(httpStatus.OK).json({
    statusCode: httpStatus.OK,
    message: i18n.translate('user.deleteSuccess'),
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
