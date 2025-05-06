const express = require('express');
const userControllers = require('../controllers/userControllers');
const authenticate = require('../controllers/authenticateUser');
const favouriteRoute = require('../routes/favouriteRoute');

const userRoute = express.Router();

userRoute.post('/signup', authenticate.signUp);
userRoute.post('/login', authenticate.login);

userRoute.use('/:userId/favourite', favouriteRoute);

//geting user profile
userRoute.get('/profile', authenticate.protect, authenticate.getUserProfile);
//update user profile
userRoute.post(
  '/profileupdate',
  authenticate.protect,
  authenticate.updateProfile
);

//forgotpassword route

userRoute.post('/forgotpassword', authenticate.forgotPassword);
userRoute.post('/resetpassword/:token', authenticate.resetPassword);
userRoute.delete('/deleteme', authenticate.protect, userControllers.deleteMe);

userRoute
  .route('/')
  .get(
    authenticate.protect,
    authenticate.restrictTo('admin', 'dev'),
    userControllers.getallusers
  )
  .post(userControllers.postUser);

userRoute
  .route('/:userId')
  .get(userControllers.getUserById)
  .patch(userControllers.patchUserById)
  .delete(userControllers.deleteUserById);
module.exports = userRoute;
