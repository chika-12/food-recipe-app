const express = require('express');
const reviewRoute = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authenticateUser');

reviewRoute
  .route('/')
  .get(
    authControllers.protect,
    authControllers.restrictTo('admin'),
    reviewController.getAllReviews
  )
  .post(authControllers.protect, reviewController.createReviews);
reviewRoute
  .route('/:reviewId')
  .delete(authControllers.protect, reviewController.deleteReview)
  .patch(authControllers.protect, reviewController.updateReviews);

module.exports = reviewRoute;
