const express = require('express');

const { validate } = require('../../middlewares');
const { auth, author } = require('../../middlewares/auth.middleware');
const { userValidation } = require('../../validations');
const { userController } = require('../../controllers');

const userRoute = express.Router();

userRoute.use(auth);

userRoute.route('/').get(validate(userValidation.getUsers), userController.getUsers);

userRoute.use(author(['admin']));

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
