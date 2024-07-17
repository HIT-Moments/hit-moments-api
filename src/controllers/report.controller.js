const https = require('http-status');

const { i18n } = require('../config');
const { Report, Moment } = require('../models');
const { ApiError, catchAsync } = require('../utils');
const { LIMIT_DEFAULT, PAGE_DEFAULT } = require('../constants');

const createReport = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { momentId } = req.body;

  const momentExisting = await Report.findOne({ momentId: momentId });
  const reportExisting = await Report.findOne({ userId: userId, momentId: momentId });

  if (!momentExisting) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  if (reportExisting) {
    throw new ApiError(https.CONFLICT, i18n.translate('report.existed'));
  }

  const report = await Report.create({ ...req.body, userId });

  return res.status(https.CREATED).json({
    statusCode: https.CREATED,
    message: i18n.translate('report.createSuccess'),
    data: {
      report,
    },
  });
});

const getReportOfMoment = catchAsync(async (req, res, next) => {
  const momentId = req.params.momentId;

  const momentExisting = await Moment.findById(momentId);
  const reportOfMoment = await Report.find({ momentId: momentId });

  if (!momentExisting) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('moment.momentNotFound'));
  }

  res.json({
    statusCode: https.OK,
    message: i18n.translate('report.getDetail'),
    data: {
      reportOfMoment,
    },
  });
});

const getList = catchAsync(async (req, res, next) => {
  const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = req.query;
  
  const skip = (+page - 1) * limit;
  const query = {};

  const [reports, totalResults] = await Promise.all([
    Report.find().limit(limit).skip(skip),
    Report.countDocuments(query)
  ])
 

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
  getReportOfMoment,
  getList,
  deleteReport,
};
