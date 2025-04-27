const express = require('express');
const recipeRoute = express.Router();
const recipeControllers = require('../controllers/recipeControllers');

recipeRoute.route('/').get(recipeControllers.getAllRecipe);

module.exports = recipeRoute;
