const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Create Schema
const SavedRecipeSchema = new Schema({
  UserId: {
    type: String,
    required: true
  },
  RecipeId: {
    type: String,
    required: true
  },
  RecipeName: {
    type: String
  },
  Time: {
    type: []
  },
  Difficulty: {
    type: Number
  },
  Description: {
    type: String
  },
  Ingredients: {
    type: []
  },
  Equipment: {
    type: []
  },
  Instructions: {
    type: []
  },
  Image: {
    type: String
  },
  Rating: {
    type: Number
  },
  NumOfRatings: {
    type: Number
  },
  SumOfRatings: {
    type: Number
  }
});

module.exports = SavedRecipe = mongoose.model('SavedRecipes', SavedRecipeSchema);