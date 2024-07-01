const express = require('express');

const {validate , auth , author} = require('../../middlewares');
const {friendValidation} = require('../../validations');
const {friendController} = require('../../controllers');

const friendRoute = express.Router();

friendRoute.use(auth);

friendRoute
  .route('/')
  .post(validate(friendValidation.createFriend), friendController.createFriend);

friendRoute
  .route('/:friendId')
  .delete(validate(friendController.deleteFriend) , friendController.deleteFriend);

friendRoute.use(author(["admin"]));

friendRoute
  .route('/')
  .get(friendController.getList);

friendRoute
  .route('/:friendId')
  .get(validate(friendValidation.getDetail), friendController.getDetail)


module.exports = friendRoute;
