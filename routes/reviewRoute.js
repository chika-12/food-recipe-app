const express = require('express');
const reviewRoute = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authenticateUser');

reviewRoute
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authControllers.protect, reviewController.createReviews);

module.exports = reviewRoute;
