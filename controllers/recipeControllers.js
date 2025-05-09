//const { options } = require('../app');
const Recipe = require('../models/recipeModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/feautures');

exports.getAllRecipe = catchAsync(async (req, res, next) => {
  const allRecipe = new ApiFeatures(Recipe.find(), req.query)
    .filtering()
    .sorting()
    .limitFields()
    .pagination();

  const data = await allRecipe.query;
  if (!data) {
    return next(
      new AppError('All recipe deleted or Internal server error', 500)
    );
  }
  res.status(200).json({
    count: data.length,
    data,
  });
});

exports.getRecipeById = catchAsync(async (req, res, next) => {
  const specificRecipe = await Recipe.findById(req.params.recipeId)
    .populate({
      path: 'comment',
      select: 'comment ratings -recipe',
    })
    .populate({ path: 'user', select: 'name' });

  if (!specificRecipe) {
    return next(new AppError('Recipe Not found', 404));
  }

  res.status(200).json({
    status: 'Sucess',
    specificRecipe,
  });
});

//Not Working yet
exports.getSpecificMeal = catchAsync(async (req, res, next) => {
  const { title } = req.query;
  if (!title) {
    return next(new AppError('Title query is required', 400));
  }

  const data = await Recipe.find({ title: title });

  console.log('Searching for title:', title);
  if (!data || data.length === 0) {
    return next(new AppError('No Data Found', 404));
  }
  res.status(200).json({
    status: 'Success',
    data,
  });
});

exports.postRecipe = catchAsync(async (req, res, next) => {
  const data = await Recipe.create(req.body);

  if (!data) {
    return next(new AppError('Data not posted', 400));
  }

  res.status(201).json({
    status: 'Success',
    data,
  });
});

exports.patchRecipe = catchAsync(async (req, res, next) => {
  const data = await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new AppError('Data not found', 401));
  }

  res.status(200).json({
    status: 'Success',
    data,
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  await Recipe.findByIdAndDelete(req.params.recipeId);

  if (Recipe.findById(req.params.recipeId)) {
    return next(new AppError('Unable to delete data', 401));
  }

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
