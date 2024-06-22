const express = require('express');

const { validate } = require('../../middlewares');
const { authValidation } = require('../../validations');
const { authController } = require('../../controllers');

const authRoute = express.Router();

authRoute.post('/register', validate(authValidation.register), authController.register);

module.exports = authRoute;
