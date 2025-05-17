const express = require('express');
const favouriteRoute = express.Router({ mergeParams: true });
const favouriteControllers = require('../controllers/favoriteControllers');
const authenticate = require('../controllers/authenticateUser');

favouriteRoute
  .route('/')
  .get(
    /*authenticate.protect,
    authenticate.restrictTo('admin'),*/
    favouriteControllers.showAllFavouriteList
  )
  .post(authenticate.protect, favouriteControllers.addToFavourite);
favouriteRoute
  .route('/:id')
  .delete(authenticate.protect, favouriteControllers.deleteFromFavorite);

module.exports = favouriteRoute;
