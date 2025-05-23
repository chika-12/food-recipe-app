const express = require('express');
const userControllers = require('../controllers/userControllers');
const authenticate = require('../controllers/authenticateUser');
//const favouriteRoute = require('../routes/favouriteRoute');

const userRoute = express.Router();

//sign up and login
userRoute.post('/signup', authenticate.signUp);
userRoute.post('/login', authenticate.login);

//userRoute.use('/:userId/favourite', favouriteRoute);

//geting user profile
userRoute.get('/profile', authenticate.protect, userControllers.getUserProfile);
//update user profile
userRoute.post(
  '/profileupdate',
  authenticate.protect,
  userControllers.updateProfile
);

//forgotpassword route restpasswor delete route

userRoute.post('/forgotpassword', authenticate.forgotPassword);
userRoute.post('/resetpassword/:token', authenticate.resetPassword);
userRoute.delete('/deleteme', authenticate.protect, userControllers.deleteMe);

//Get notification
userRoute
  .route('/notification')
  .get(authenticate.protect, userControllers.getNotificationById);

userRoute.route('/:id/recipe').get(userControllers.fetchUserRecipe);

//Follwing and unfollowing route

userRoute
  .route('/:id/follow')
  .post(authenticate.protect, userControllers.followers);

// Get all users
userRoute
  .route('/')
  .get(
    authenticate.protect,
    /*authenticate.restrictTo('admin', 'dev'),*/
    userControllers.getallusers
  )
  .post(userControllers.postUser); // Unauthorised route

userRoute
  .route('/:id')
  .get(userControllers.getUserById)
  .patch(userControllers.patchUserById)
  .delete(userControllers.deleteUserById);
module.exports = userRoute;
