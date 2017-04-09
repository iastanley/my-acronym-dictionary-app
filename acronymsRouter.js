'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

router.use(bodyParser.json());

//get all acronyms
router.get('/', (req, res) => {

});

module.exports = router;
