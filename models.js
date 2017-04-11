'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

//model for acronym entries
const acronymSchema = mongoose.Schema({
  userId: {type: String, required: true},
  acronym: {type: String, required: true},
  spellOut: {type: String, required: true},
  definition: String,
  categoryId: {type: String}
});

//creating response method to avoid _id vs id issues
acronymSchema.methods.apiResponse = function() {
  return {
    id: this.id,
    userId: this.userId,
    acronym: this.acronym,
    spellOut: this.spellOut,
    definition: this.definition,
    categoryId: this.categoryId
  }
}

const Acronym = mongoose.model('Acronym', acronymSchema);

//model for categories
const categorySchema = mongoose.Schema({
  title: String,
  color: String
});

const Category = mongoose.model('Category', categorySchema);

//model for users
const userSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.methods.apiResponse = function() {
  return {
    username: this.username
  }
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

//statics is like a class method - can be called directly on Model
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', userSchema);

module.exports = {Acronym, Category, User};
