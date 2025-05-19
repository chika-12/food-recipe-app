const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RecipeUser = require('../models/userModels');
const factory = require('./factoryFunction');
//const { populate } = require('../models/recipeModels');
const cache = require('../utils/cache');
const Notification = require('../models/notification');

exports.postUser = catchAsync(async (req, res, next) => {
  res.status(503).json({
    status: 'Unauthorized',
    message: 'Unauthorized route please use signup',
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await RecipeUser.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const cacheKey = `RecipeUser_all`;
  const cacheData = cache.get(cacheKey);

  if (cacheData) {
    return res.status(200).json({
      status: 'success',
      source: 'cache',
      data: cacheData,
    });
  }
  const profile = await RecipeUser.findById(req.user.id)
    .populate({
      path: 'favorite', // first populate the virtual on User
      populate: {
        path: 'favoriteRecipe', // then populate the recipe field on FavoriteRecipe
        model: 'Recipe', // make sure this matches your Recipe model name
        select: 'title ingredients instructions imageUrl', // pick whatever fields you need
      },
    })
    .populate('followers', 'name avatarUrl')
    .populate('following', 'name avatarUrl');

  if (!profile) {
    return next(new AppError('This user does not exist', 404));
  }
  cache.set(cacheKey, profile.toObject());

  res.status(200).json({
    Status: 'Success',
    profile,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const filtered = filteredObject(req.body, 'name', 'bio');
  const user = await RecipeUser.findByIdAndUpdate(req.user.id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  statusResponseHandler(user, 200, res);
});

exports.getallusers = factory.getall(RecipeUser);

exports.deleteUserById = factory.deleteOne(RecipeUser);

exports.patchUserById = factory.patchOne(RecipeUser);

exports.getUserById = factory.getOneById(RecipeUser, [
  // Populate favorite -> favoriteRecipe
  {
    path: 'favorite',
    populate: {
      path: 'favoriteRecipe',
      model: 'Recipe',
      select: 'title ingredients instructions image',
    },
  },
  // Populate followers
  {
    path: 'followers',
    select: 'name avatarUrl',
  },
  // Populate following
  {
    path: 'following',
    select: 'name avatarUrl',
  },
]);

exports.getNotificationById = factory.getNotification(Notification);

exports.fetchUserRecipe = factory.fetchUserRecipe(RecipeUser);

exports.followers = factory.followUser(RecipeUser);
