const Recipe = require('../models/recipeModels');
const factory = require('./factoryFunction');

exports.getAllRecipe = factory.getall(Recipe);

exports.getRecipeById = factory.getOneById(Recipe, {
  path: 'comment',
  select: 'comment ratings -recipe',
  populate: {
    path: 'user',
    select: 'name avatarUrl',
  },
});

//Not Working yet
exports.getSpecificMeal = factory.specifiMeal(Recipe);

exports.postRecipe = factory.createOne(Recipe);

exports.patchRecipe = factory.patchOne(Recipe);

exports.deleteRecipe = factory.deleteOne(Recipe);

exports.shareRecipe = factory.shareRecipe(Recipe);
