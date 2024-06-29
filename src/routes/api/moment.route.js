const express = require('express');

const { momentController } = require('../../controllers');
const { momentValidation } = require('../../validations');
const { auth, author, validate, upload } = require('../../middlewares');

const momentRoute = express.Router();

momentRoute.use(auth);

momentRoute
  .route('/')
  .post(upload.single('image'), validate(momentValidation.createMoment), momentController.createMoment)
  .get(validate(momentValidation.getMoments), momentController.getMoments);

momentRoute
  .route('/:momentId')
  .get(validate(momentValidation.getMoment), momentController.getMoment)
  .delete(validate(momentValidation.deleteMoment), momentController.deleteMoment);

momentRoute.use(author(['admin']));

momentRoute.route('/:momentId').put(validate(momentValidation.updateMoment), momentController.updateMoment);

module.exports = momentRoute;
