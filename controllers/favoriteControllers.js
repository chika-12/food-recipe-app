const FavoriteRecipe = require('../models/favouriteRecipe');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryFunction');

exports.addToFavourite = factory.createOne(FavoriteRecipe);

exports.showAllFavouriteList = factory.getall(FavoriteRecipe);

exports.deleteFromFavorite = factory.deleteOne(FavoriteRecipe);
