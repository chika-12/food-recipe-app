const Reviews = require('../models/reviewModels');
const factory = require('./factoryFunction');

exports.getAllReviews = factory.getall(Reviews);

exports.createReviews = factory.createOne(Reviews);

exports.deleteReview = factory.deleteOne(Reviews);

exports.updateReviews = factory.patchOne(Reviews);
