const express = require('express');

const { validate , auth } = require('../../middlewares');
const { reportValidation } = require('../../validations');
const { reportController } = require('../../controllers');

const reportRoute = express.Router();

reportRoute.use(auth);

reportRoute
  .route('/')
  .post(validate(reportValidation.createReport), reportController.createReport);

reportRoute
  .route('/:reportId')
  .get(validate(reportValidation.getDetail), reportController.getDetail)
  .delete(validate(reportValidation.deleteReport), reportController.deleteReport);

module.exports = reportRoute;
