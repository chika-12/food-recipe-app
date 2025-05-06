const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RecipeUser = require('../models/userModels');

exports.getallusers = catchAsync(async (req, res, next) => {
  const user = await RecipeUser.find();

  if (!user) {
    return next(new AppError('No user found', 404));
  }
  res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.postUser = catchAsync(async (req, res, next) => {
  res.status(503).json({
    status: 'maintainance',
    message: 'Work in progress',
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await RecipeUser.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  res.status(503).json({
    status: 'Service Unavailable',
    message: 'Work in progress',
  });
});

exports.patchUserById = catchAsync(async (req, res, next) => {
  res.status(503).json({
    status: 'Service Unavailable',
    message: 'Work in progress',
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const specificUser = await RecipeUser.findById(req.params.userId).populate(
    'favourite'
  );
  if (!specificUser) {
    return next(new AppError('No user found', 404));
  }
  res.status(200).json({
    status: 'Success',
    specificUser,
  });
});
