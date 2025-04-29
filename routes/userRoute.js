const express = require('express');
const userControllers = require('../controllers/userControllers');
const authenticate = require('../controllers/authenticateUser');

const userRoute = express.Router();

userRoute.post('/signup', authenticate.signUp);
userRoute.post('/login', authenticate.login);
userRoute
  .route('/')
  .get(userControllers.getallusers)
  .post(userControllers.postUser);

userRoute
  .route('/:userId')
  .get(userControllers.getUserById)
  .patch(userControllers.patchUserById)
  .delete(userControllers.deleteUserById);
module.exports = userRoute;
