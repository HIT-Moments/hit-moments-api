const express = require('express');

const { momentController } = require('../../controllers');
const { momentValidation } = require('../../validations');
const { auth, validate, upload } = require('../../middlewares');

const momentRoute = express.Router();

momentRoute.use(auth);

momentRoute
  .route('/')
  .post(upload('image'), validate(momentValidation.createMoment), momentController.createMoment)
  .get(validate(momentValidation.getMoments), momentController.getMoments);

momentRoute.route('/me').get(momentController.getMyMoments);

momentRoute
  .route('/import')
  .post(upload('file'), validate(momentController.importMoments), momentController.importMoments);

momentRoute
  .route('/temporary')
  .post(validate(momentValidation.moveMomentToPermanent), momentController.moveMomentToPermanent);

momentRoute
  .route('/:momentId')
  .get(validate(momentValidation.getMoment), momentController.getMoment)
  .delete(validate(momentValidation.deleteMoment), momentController.deleteMoment)
  .put(validate(momentValidation.updateMoment), momentController.updateMoment)
  .patch(validate(momentValidation.restoreMoment), momentController.restoreMoment);

momentRoute.route('/user/:userId').get(validate(momentValidation.getMomentsByUser), momentController.getMomentsByUser);

module.exports = momentRoute;
