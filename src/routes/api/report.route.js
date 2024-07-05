const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { reportValidation } = require('../../validations');
const { reportController } = require('../../controllers');

const reportRoute = express.Router();

reportRoute.use(auth);

reportRoute.route('/').post(validate(reportValidation.createReport), reportController.createReport);

reportRoute.use(author(['admin']));

reportRoute.route('/').get(reportController.getList);

reportRoute.route('/:momentId').get(validate(reportValidation.getReportOfMoment), reportController.getReportOfMoment);

reportRoute
  .route('/:reportId')
  .delete(validate(reportValidation.deleteReport), reportController.deleteReport);

module.exports = reportRoute;
