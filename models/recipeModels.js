const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
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
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
