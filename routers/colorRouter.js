'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Color} = require('../models');

router.use(bodyParser.json());

router.get('/', (req, res) => {
  Color
    .find()
    .exec()
    .then(colors => {
      res.status(200).json(colors);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
