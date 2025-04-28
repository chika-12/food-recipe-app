const express = require('express');
const userControllers = require('../controllers/userControllers');

const userRoute = express.Router();

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
