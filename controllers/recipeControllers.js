const Recipe = require('../models/recipeModels');

exports.getAllRecipe = async (req, res, next) => {
  const allRecipe = await Recipe.find();

  res.status(200).json({
    count: allRecipe.length,
    allRecipe,
  });
};
