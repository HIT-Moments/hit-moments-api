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

momentRoute.route('/me').get(momentController.getMyMoments);

momentRoute
  .route('/:momentId')
  .get(validate(momentValidation.getMoment), momentController.getMoment)
  .delete(validate(momentValidation.deleteMoment), momentController.deleteMoment)
  .put(validate(momentValidation.updateMoment), momentController.updateMoment)
  .patch(validate(momentValidation.restoreMoment), momentController.restoreMoment);

momentRoute.route('/user/:userId').get(validate(momentValidation.getMomentsByUser), momentController.getMomentsByUser);

module.exports = momentRoute;
