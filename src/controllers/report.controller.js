const https = require('http-status');

const { i18n } = require('../config');
const { Report } = require('../models');
const { ApiError, catchAsync } = require('../utils');

const createReport = catchAsync(async (req, res, next) => {
  // #TODO check exist report
  req.body.userId = '662cf6c351d7d3424baea277';
  const report = await Report.create(req.body);
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
    message: i18n.translate('report.getDetail'),
    statusCode: https.OK,
    data: {
      report,
    },
  });
});

const getList = catchAsync(async (req, res, next) => {
  const reports = await Report.find();
  res.json({
    message: i18n.translate('report.getList'),
    statusCode: https.OK,
    data: {
      reports,
    },
  });
});

const deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findByIdAndDelete(req.params.reportId);
  if (!report) {
    throw new ApiError(https.NOT_FOUND, i18n.translate('report.notFound'));
  }

  res.json({
    message: i18n.translate('report.deleteSuccess'),
    statusCode: https.OK,
  });
});

module.exports = {
  createReport,
  getDetail,
  getList,
  deleteReport,
};
