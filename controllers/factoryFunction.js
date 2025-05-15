const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/feautures');
const sendEmail = require('../utils/emailServices');

exports.getall = (model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.recipeId) filter = { recipe: req.params.recipeId };
    const docs = new ApiFeatures(model.find(filter), req.query)
      .filtering()
      .sorting()
      .limitFields()
      .pagination();

    const data = await docs.query;
    if (!data) {
      return next(new AppError('Internal server error', 500));
    }
    res.status(200).json({
      count: data.length,
      data,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    if (model === Reviews) {
      if (!req.body.recipe) req.body.recipe = req.params.recipeId;
    }

    if (model === FavoriteRecipe) {
      if (!req.body.favoriteRecipe)
        req.body.favoriteRecipe = req.params.recipeId;
    }
    const data = await model.create(req.body);

    if (!data) {
      return next(new AppError('Data not posted', 400));
    }

    res.status(201).json({
      status: 'Success',
      data,
    });
  });

exports.getOneById = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.recipeId);
    if (popOptions)
      query = model.findById(req.params.recipeId).populate(popOptions);
    const data = await query;

    if (!data) {
      return next(new AppError('Data Not found', 404));
    }

    res.status(200).json({
      status: 'Sucess',
      data,
    });
  });

exports.patchOne = (model) =>
  catchAsync(async (req, res, next) => {
    const data = await model.findByIdAndUpdate(req.params.recipeId, req.body, {
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

exports.specifiMeal = (model) =>
  catchAsync(async (req, res, next) => {
    const { title } = req.query;
    if (!title) {
      return next(new AppError('Title query is required', 400));
    }

    const data = await model.find({ title: title });

    console.log('Searching for title:', title);
    if (!data || data.length === 0) {
      return next(new AppError('No Data Found', 404));
    }
    res.status(200).json({
      status: 'Success',
      data,
    });
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    await model.findByIdAndDelete(req.params.recipeId);

    if (model.findById(req.params.recipeId)) {
      return next(new AppError('Unable to delete data', 401));
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.shareRecipe = (model) =>
  catchAsync(async (req, res, next) => {
    const receiver = model.findById(req.params.recipeId);
    const user = req.user;
    const sharedRecipe = req.body.recipeId;

    if (!sharedRecipeId) {
      return next(new AppError('Document not found', 404));
    }

    const showRecipe = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/recipe/${sharedRecipe}`;
    const message = `${user.name} shared a recipe with you click on the link to check it out ${showRecipe}`;

    sendEmail({
      email: `from ${user.email} to  ${receiver}`,
      subject: 'Love to check out this recipe',
      message,
    });
    res.status(200).json({
      Status: 'Success',
      message: 'Recipe Shared',
    });
  });
