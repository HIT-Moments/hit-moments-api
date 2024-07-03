const express = require('express');

const { validate, auth, author } = require('../../middlewares');
const { friendValidation } = require('../../validations');
const { friendController } = require('../../controllers');

const friendRoute = express.Router();

friendRoute.use(auth);
friendRoute.route('/').post(validate(friendValidation.createFriend) , friendController.createFriend);
friendRoute.route('/:userId/invite').post(validate(friendValidation.sendRequest), friendController.sendRequest);
friendRoute.route('/:userId').get(validate(friendValidation.listReceivedRequests), friendController.listReceivedRequests)
friendRoute.route('/:friendId').delete(validate(friendController.deleteFriend), friendController.deleteFriend);

friendRoute.use(author(['admin']));

friendRoute.route('/').get(friendController.getList);



module.exports = friendRoute;
