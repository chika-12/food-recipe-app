const mongoose = require('mongoose');
require('./userModels');

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Comment must be available'],
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'RecipeUser',
      },
    ],

    recipe: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe',
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

reviewSchema.virtual('userDetails', {
  ref: 'RecipeUser',
  foreignField: '_id',
  localField: 'user',
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name avataUrl' }).populate({
    path: 'recipe',
    select: 'title',
  });
  next();
});

const ReviewUser = mongoose.model('ReviewUser', reviewSchema);

module.exports = ReviewUser;
