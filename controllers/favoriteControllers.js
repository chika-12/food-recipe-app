const FavoriteRecipe = require('../models/favouriteRecipe');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.addToFavourite = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.favoriteRecipe) req.body.favoriteRecipe = req.params.recipeId;

  const addFavourite = await FavoriteRecipe.create(req.body);
  if (!req.body.favoriteRecipe) {
    return next(new AppError('Favourite not added', 500));
  }

  res.status(201).json({
    Status: 'Success',
    addFavourite,
  });
});

exports.showAllFavouriteList = catchAsync(async (req, res, next) => {
  const allFavourite = await FavoriteRecipe.find();

  if (!allFavourite || allFavourite.length === 0) {
    return next(new AppError('No list', 404));
  }
  res.status(200).json({
    Status: 'Success',
    allFavourite,
  });
});
