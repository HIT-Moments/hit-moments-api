const express = require('express');

const { userValidation } = require('../../validations');
const { userController } = require('../../controllers');
const { auth, author, validate } = require('../../middlewares');

const userRoute = express.Router();

userRoute.use(auth);

userRoute.route('/').get(validate(userValidation.getUsers), userController.getUsers);

userRoute.use(author(['admin']));

userRoute.route('/').post(validate(userValidation.createUser), userController.createUser);

userRoute
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

module.exports = userRoute;
