const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { friendValidation } = require('../../validations');
const { friendController } = require('../../controllers');

const friendRoute = express.Router();

friendRoute.use(auth);
friendRoute.route('/').post(validate(friendValidation.createFriend), friendController.createFriend);
friendRoute.route('/invite').post(validate(friendValidation.sendRequest), friendController.sendRequest);
friendRoute
  .route('/list-request')
  .get(validate(friendValidation.listReceivedRequests), friendController.listReceivedRequests);
friendRoute.route('/confirm-request').post(validate(friendValidation.acceptRequest), friendController.acceptRequest);
friendRoute.route('/delince-request').post(validate(friendValidation.delinceRequest), friendController.delinceRequest);
friendRoute.route('/list-friends').get(validate(friendValidation.getListFriends), friendController.getListFriends);
friendRoute.route('/delete-friend').delete(validate(friendController.deleteFriend), friendController.deleteFriend);
friendRoute.route('/block-friend').post(validate(friendController.blockFriend), friendController.blockFriend);
friendRoute.route('/unblock-friend').post(validate(friendController.unblockFriend), friendController.unblockFriend);
friendRoute.route('/list-blocks').get(friendController.getListBlock);

module.exports = friendRoute;
