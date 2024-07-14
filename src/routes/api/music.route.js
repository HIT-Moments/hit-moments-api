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
  .get(validate(musicValidation.getMusicById), musicController.getMusicById)
  .delete(author(['admin']), validate(musicValidation.deleteMusic), musicController.deleteMusicById)
  .put(author(['admin']), upload.single('file'), validate(musicValidation.updateMusic), musicController.updateMusicById);

module.exports = musicRoute;
