const https = require('http-status');

const { i18n } = require('../config');
const { Report, User } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createReport = catchAsync(async (req, res, next) => {
  const reportExisting = await Report.findOne({postId : req.body.postId  , userId : req.user._id});
  if (reportExisting) {
    throw new ApiError(https.CONFLICT, i18n.translate('report.existed'));
  }
  const userId = req.user._id;
  const report = await Report.create({...req.body , userId});
  return res.status(https.CREATED).json({
    statusCode: https.CREATED,
    message: i18n.translate('report.createSuccess'),
    data: {
      report,
    },
  });
});

const getDetail = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.reportId);
  if (!report) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('report.notFound'));
  }
  res.json({
    statusCode: https.OK,
    message: i18n.translate('report.getDetail'),
    data: {
      report,
    },
  });
});

const getList = catchAsync(async (req, res, next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;

  const skip = (+page - 1) * limit;
  const query = {};

  const reports = await Report.find().limit(limit).skip(skip);
  const totalResults = await Report.countDocuments(query);

  res.json({
    message: i18n.translate('report.getList'),
    statusCode: https.OK,
    data: {
      reports,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(totalResults / +limit),
      totalResults,
    },
  });
});

const deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findByIdAndDelete(req.params.reportId);
  if (!report) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('report.notFound'));
  }

  res.json({
    statusCode: https.OK,
    message: i18n.translate('report.deleteSuccess'),
  });
});

module.exports = {
  createReport,
  getDetail,
  getList,
  deleteReport,
};
