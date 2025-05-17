const mongoose = require('mongoose');
require('./userModels');
require('./reviewModels');

const recipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'RecipeUser',
    },
    title: {
      type: String,
      required: [true, 'A recipe must have a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A recipe must have description'],
      trim: true,
    },
    ingredients: {
      type: [String],
      requiered: [true, 'A recipe must have an array of ingredient'],
    },
    instructions: {
      type: [String],
      required: [true, 'A recipe must have instructions'],
      trim: true,
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time required'],
    },
    servings: {
      type: Number,
      default: 1,
    },
    image: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

recipeSchema.virtual('comment', {
  ref: 'ReviewUser',
  foreignField: 'recipe',
  localField: '_id',
});
recipeSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name avatarUrl _id' });
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
