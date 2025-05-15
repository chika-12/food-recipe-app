const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RecipeUser = require('../models/userModels');
const factory = require('./factoryFunction');
const { populate } = require('../models/recipeModels');

exports.getallusers = factory.getall(RecipeUser);
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

exports.deleteUserById = factory.deleteOne(RecipeUser);

exports.patchUserById = factory.patchOne(RecipeUser);

exports.getUserById = factory.getOneById(RecipeUser, { path: 'favorite' });
