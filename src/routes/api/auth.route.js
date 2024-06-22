const express = require('express');

const { validate } = require('../../middlewares');
const { authValidation } = require('../../validations');
const { authController } = require('../../controllers');

const authRoute = express.Router();

authRoute.post('/register', validate(authValidation.register), authController.register);

authRoute.post('/login', validate(authValidation.login), authController.login);

module.exports = authRoute;
