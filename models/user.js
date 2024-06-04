const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const UserSchema = new Schema({
  UserId: {
    type: Number
  },
  FirstName: {
    type: String,
    min: 2,
    max: 50,
    required: true
  },
  LastName: {
    type: String,
    min: 2,
    max: 50,
    required: true
  },
  Email: {
    type: String,
    min: 2,
    max: 50,
    required: true
  },
  Login: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  verificationToken: String,
  VerificationTokenExpires: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = User = mongoose.model("Users", UserSchema, "Users");
