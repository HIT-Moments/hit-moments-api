const express = require('express');

const { validate } = require('../../middlewares');
const { userValidation } = require('../../validations');
const { userController } = require('../../controllers');

const userRoute = express.Router();

userRoute
  .route('/')
  .post(validate(userValidation.createUser), userController.createUser)
  .get(validate(userValidation.getUsers), userController.getUsers);

userRoute
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

module.exports = userRoute;
