const express = require('express');

const { auth, validate } = require('../../middlewares');
const { authValidation } = require('../../validations');
const { authController } = require('../../controllers');

const authRoute = express.Router();

authRoute.post('/register', validate(authValidation.register), authController.register);

authRoute.post('/login', validate(authValidation.login), authController.login);

authRoute
  .get('/me', auth, authController.getMe)
  .put('/me', auth, validate(authValidation.updateProfile), authController.updateProfile);

authRoute.put('/change-password', auth, validate(authValidation.changePassword), authController.changePassword);

authRoute.get('/verify', authController.verifyEmail);

module.exports = authRoute;
