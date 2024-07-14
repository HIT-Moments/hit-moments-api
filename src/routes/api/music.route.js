const express = require('express');

const { musicController } = require('../../controllers');
const { musicValidation } =  require('../../validations');
const { auth, author, upload, validate } = require('../../middlewares');

const musicRoute = express.Router();

musicRoute.use(auth);

musicRoute
  .route('/')
  .get(validate(musicValidation.getMusic), musicController.getMusic)
  .post(author(['admin']), upload.single('file'), validate(musicValidation.createMusic), musicController.createMusic);

musicRoute
  .route('/:musicId')
  .get(validate(musicValidation.getMusicByID), musicController.getMusicByID)
  .delete(validate(musicValidation.deleteMusic), musicController.deleteMusicById)
  .put(upload.single('file'), validate(musicValidation.updateMusic), musicController.updateMusicById);

module.exports = musicRoute;
