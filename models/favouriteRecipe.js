const mongoose = require('mongoose');

const favouriteRecipeSchema = new mongoose.Schema({
  favoriteRecipe: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Recipe',
      require: [true, 'What is the favourite recipe'],
    },
  ],
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'RecipeUser',
      required: [true, 'User needed'],
    },
  ],
});

const FavouritRecipe = mongoose.model('FavouriteRecipe', favouriteRecipeSchema);
module.exports = FavouritRecipe;
