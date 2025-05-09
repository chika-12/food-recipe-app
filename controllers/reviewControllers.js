const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Reviews = require('../models/reviewModels');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.recipeId) filter = { recipe: req.params.recipeId };
  const review = await Reviews.find();

  if (!review || review.length === 0) {
    return next(new AppError('No review yet', 404));
  }

  res.status(200).json({
    Status: 'Success',
    data: {
      review,
    },
  });
});

exports.createReviews = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.recipe) req.body.recipe = req.params.recipeId;

  const createdReview = await Reviews.create(req.body);

  if (!createdReview) {
    return next(new AppError('Review not created', 500));
  }
  res.status(201).json({
    Status: 'Success',
    createdReview,
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  await Reviews.findByIdAndDelete(req.params.reviewId);

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
  const updatedData = await Reviews.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    { new: true, runValidators: true, context: 'query' }
  );

  if (!updatedData) {
    return next(new AppError('Data not updated', 500));
  }
  res.status(201).json({
    Status: 'Success',
    updatedData,
  });
});
