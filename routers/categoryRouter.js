'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Acronym, Category, Color} = require('../models');

router.use(bodyParser.json());

router.get('/', (req, res) => {
  let currentUser;
  if (req.session && req.session.user) {
    currentUser = req.session.user;
  }
  Category
    .find(username: currentUser)
    .exec()
    .then(categories => {
      res.status(200).json(categories.map(category => category.apiResponse()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.get('/:id', (req, res) => {
  Category
    .findById(req.params.id)
    .exec()
    .then(category => {
      res.status(200).json(category.apiResponse());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.post('/', (req, res) => {
  let currentUser;
  if (req.session && req.session.user) {
    currentUser = req.session.user;
  }
  const requiredFields = ['title', 'color'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Category
    .create({
      username: currentUser,
      title: req.body.title,
      color: req.body.color
    })
    .then(category => {
      res.status(201).json(category.apiResponse());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/:id', (req, res) => {
  let currentUser;
  if (req.session && req.session.user) {
    currentUser = req.session.user;
  }
  const deletedId = req.params.id;
  Category
    .findByIdAndRemove(deletedId)
    .exec()
    .then(category => {
      return Color
        .findOneAndUpdate(
          {username: currentUser, hexCode: category.color},
          {$set: {used: 'false'}}
        )
        .exec();
    })
    .then(() => {
      return Acronym
        .find({categoryId: deletedId})
        .remove()
        .exec();
    })
    .then(() => res.status(204).end())
    .catch(err => {
      console.error('Internal server error at Category router: DELETE request', err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
