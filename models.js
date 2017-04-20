'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

//MODEL FOR ACRONYMS
const acronymSchema = mongoose.Schema({
  username: {type: String, required: true},
  acronym: {type: String, required: true},
  spellOut: {type: String, required: true},
  definition: String,
  categoryId: String
});

//creating response method to avoid _id vs id issues
acronymSchema.methods.apiResponse = function() {
  return {
    id: this.id,
    username: this.username,
    acronym: this.acronym,
    spellOut: this.spellOut,
    definition: this.definition,
    categoryId: this.categoryId
  }
}

const Acronym = mongoose.model('Acronym', acronymSchema);

//MODEL FOR CATEGORIES
const categorySchema = mongoose.Schema({
  username: String,
  title: String,
  color: String
});

//creating response method to avoid _id vs id issues
categorySchema.methods.apiResponse = function() {
  return {
    id: this.id,
    username: this.username,
    title: this.title,
    color: this.color
  }
}

const Category = mongoose.model('Category', categorySchema);

//MODEL FOR COLORS
const colorSchema = mongoose.Schema({
  username: String,
  hexCode: String,
  used: String
});

const Color = mongoose.model('Color', colorSchema);

//MODEL FOR USERS
const userSchema = mongoose.Schema({
  username: {
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

module.exports = {Acronym, Category, Color, User};
