const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Create Schema
const RecipeSchema = new Schema({
  UserId: {
    type: String,
    required: true
  },
  RecipeName: {
    type: String,
    required: true
  },
  Time: {
    type: [],
    required: true
  },
  Difficulty: {
    type: Number,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Ingredients: {
    type: [],
    required: true
  },
  Equipment: {
    type: [],
    required: true
  },
  Instructions: {
    type: [],
    required: true
  },
  Image: {
    type: String,
    required: true
  },
  Rating: {
    type: Number,
    required: true
  },
  NumOfRatings: {
    type: Number,
    required: true
  },
  SumOfRatings: {
    type: Number,
    required: true
  }
});

module.exports = Recipe = mongoose.model('Recipes', RecipeSchema);