const mongoose = require('mongoose');
require('./recipeModels');

const favouriteRecipeSchema = new mongoose.Schema({
  favoriteRecipe: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Recipe',
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

favouriteRecipeSchema.pre('save', async function (next) {
  await this.populate({ path: 'favoriteRecipe' });
  await this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});
const FavoriteRecipe = mongoose.model('FavoriteRecipe', favouriteRecipeSchema);
module.exports = FavoriteRecipe;
