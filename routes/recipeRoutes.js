const express = require('express');
const recipeRoute = express.Router();
const recipeControllers = require('../controllers/recipeControllers');
const authenticate = require('../controllers/authenticateUser');

recipeRoute
  .route('/search')
  .get(authenticate.protect, recipeControllers.getAllRecipe);
recipeRoute.route('/meal').get(recipeControllers.getSpecificMeal);
recipeRoute.route('/').post(authenticate.protect, recipeControllers.postRecipe);

recipeRoute
  .route('/:recipeId')
  .get(recipeControllers.getRecipeById)
  .patch(recipeControllers.patchRecipe);
module.exports = recipeRoute;
