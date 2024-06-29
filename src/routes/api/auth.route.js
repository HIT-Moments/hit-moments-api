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

authRoute.get('/verify', validate(authValidation.verifyEmail), authController.verifyEmail);

authRoute.post(
  '/resend-verification-email',
  validate(authValidation.resendVerificationEmail),
  authController.resendVerificationEmail,
);

authRoute.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

authRoute.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

module.exports = authRoute;
