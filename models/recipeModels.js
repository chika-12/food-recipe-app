const mongoose = require('mongoose');
const RecipeUser = require('./userModels');

const recipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeUser' },
  userName: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeUser' },
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
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeUser' },
      value: Number,
    },
  ],

  comment: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeUser' },
      content: String,
      createdAt: Date,
    },
  ],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      platform: String,
      sharedAt: Date,
    },
  ],
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
