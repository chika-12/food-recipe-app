const mongoose = require('mongoose');

const favouriteRecipeSchema = new mongoose.Schema({
  favoriteRecipe: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'RecipeUser',
      required: [true, 'What is the favourite recipe'],
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

const FavoriteRecipe = mongoose.model('FavoriteRecipe', favouriteRecipeSchema);
module.exports = FavoriteRecipe;
