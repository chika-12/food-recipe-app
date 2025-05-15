const express = require('express');
const recipeRoute = express.Router();
const recipeControllers = require('../controllers/recipeControllers');
const authenticate = require('../controllers/authenticateUser');
const reviewRoute = require('../routes/reviewRoute');
const favouriteRoute = require('./favouriteRoute');

recipeRoute.use('/:recipeId/favorite', favouriteRoute);
recipeRoute.use('/:recipeId/review', reviewRoute);

recipeRoute
  .route('/search')
  .get(authenticate.protect, recipeControllers.getAllRecipe);
recipeRoute.route('/meal').get(recipeControllers.getSpecificMeal);
recipeRoute.route('/').post(authenticate.protect, recipeControllers.postRecipe);

//share recipe
recipeRoute
  .route('/:userId')
  .post(authenticate.protect, recipeControllers.shareRecipe);

recipeRoute
  .route('/:recipeId')
  .get(recipeControllers.getRecipeById)
  .patch(recipeControllers.patchRecipe);
module.exports = recipeRoute;
