const express = require('express');

const { validate, auth } = require('../../middlewares');
const { reactValidation } = require('../../validations');
const { reactController } = require('../../controllers');

const reactRoute = express.Router();

reactRoute.use(auth);

reactRoute.route('/').post(validate(reactValidation.createReaction), reactController.createReaction);

reactRoute.route('/:postId').get(validate(reactValidation.getReaction), reactController.getReaction);

module.exports = reactRoute;
