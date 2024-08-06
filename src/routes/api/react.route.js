const express = require('express');

const { validate, auth } = require('../../middlewares');
const { reactValidation } = require('../../validations');
const { reactController } = require('../../controllers');

const reactRoute = express.Router();

reactRoute.use(auth);

reactRoute.post('/', validate(reactValidation.sendReaction), reactController.sendReaction);

reactRoute.get('/:momentId', validate(reactValidation.getReaction), reactController.getReaction);

reactRoute.get('/reactions/:momentId', validate(reactValidation.getUserReactions), reactController.getUserReactions);

module.exports = reactRoute;
