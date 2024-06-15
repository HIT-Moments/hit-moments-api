const express = require('express');

const { validate } = require('../middlewares');
const { userValidation } = require('../validations');
const { userController } = require('../controllers');

const userRoute = express.Router();

userRoute.route('/').post(validate(userValidation.createUser), userController.createUser);

module.exports = userRoute;
