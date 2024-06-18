const express = require('express');

const { validate } = require('../../middlewares');
const { reportValidation } = require('../../validations');
const { reportController } = require('../../controllers');

const userRoute = express.Router();

userRoute
  .route('/')
  .post(validate(reportValidation.createReport), reportController.createReport)
  .get(reportController.getList);

userRoute
  .route('/:reportId')
  .get(validate(reportValidation.getDetail), reportController.getDetail)
  .post(validate(reportValidation.deleteReport), reportController.deleteReport);

module.exports = userRoute;
