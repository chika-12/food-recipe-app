const express = require('express');
const recipeRoute = express.Router();
const recipeControllers = require('../controllers/recipeControllers');

recipeRoute.route('/search').get(recipeControllers.getAllRecipe);
recipeRoute.route('/meal').get(recipeControllers.getSpecificMeal);
recipeRoute.route('/').post(recipeControllers.postRecipe);

recipeRoute
  .route('/:recipeId')
  .get(recipeControllers.getRecipeById)
  .patch(recipeControllers.patchRecipe);
module.exports = recipeRoute;
