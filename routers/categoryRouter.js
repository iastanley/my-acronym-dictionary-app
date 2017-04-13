'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Acronym, Category} = require('../models');

router.use(bodyParser.json());

router.get('/', (req, res) => {
  const filter = {};
  if (req.query.title) {
    filter.title = req.query.title;
  }
  Category
    .find(filter)
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
  const deletedId = req.params.id;
  Category
    .findByIdAndRemove(deletedId)
    .exec()
    .then(() => {
      return Acronym
        .find({categoryId: deletedId})
        .remove()
        .exec();
    })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.error('Internal server error at Category router: DELETE request', err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
