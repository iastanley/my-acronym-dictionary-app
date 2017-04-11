'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Category} = require('../models');

router.use(bodyParser.json());

router.get('/', (req, res) => {
  Category
    .find()
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
