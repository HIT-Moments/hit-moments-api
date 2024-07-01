const express = require('express');

const {validate , auth} = require('../../middlewares');
const {friendValidation} = require('../../validations');
const {friendController} = require('../../controllers');

const friendRoute = express.Router();

friendRoute
  .route('/')
  .post(validate(friendValidation.createFriend), friendController.createFriend)
  .get(friendController.getList);

friendRoute
  .route('/:friendId')
  .get(validate(friendValidation.getDetail), friendController.getDetail)
  .delete(validate(friendController.deleteFriend) , friendController.deleteFriend);

module.exports = friendRoute;
