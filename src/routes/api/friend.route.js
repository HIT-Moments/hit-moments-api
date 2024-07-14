const express = require('express');

const { validate, auth } = require('../../middlewares');
const { friendValidation } = require('../../validations');
const { friendController } = require('../../controllers');

const friendRoute = express.Router();

friendRoute.use(auth);

friendRoute.route('/search-user').get(validate(friendValidation.searchUserByEmail), friendController.searchUserByEmail);
friendRoute.route('/invite').post(validate(friendValidation.sendRequest), friendController.sendRequest);
friendRoute.route('/confirm-request').post(validate(friendValidation.acceptRequest), friendController.acceptRequest);
friendRoute.route('/delince-request').post(validate(friendValidation.delinceRequest), friendController.delinceRequest);

friendRoute.route('/list-blocks').get(friendController.getListBlock);
friendRoute.route('/list-received-request').get(friendController.listReceivedRequests);
friendRoute.route('/list-friends').get(validate(friendValidation.getListFriends), friendController.getListFriends);
friendRoute
  .route('/list-send-request')
  .get(friendController.listSentRequests);

friendRoute.route('/delete-friend').delete(validate(friendValidation.deleteFriend), friendController.deleteFriend);

friendRoute.route('/block-friend').post(validate(friendValidation.blockFriend), friendController.blockFriend);
friendRoute.route('/unblock-friend').post(validate(friendValidation.unblockFriend), friendController.unblockFriend);
friendRoute
  .route('/cancel-request')
  .post(validate(friendValidation.cancelSentRequest), friendController.cancelSentRequest);

module.exports = friendRoute;
