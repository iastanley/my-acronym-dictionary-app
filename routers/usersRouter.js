'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();


router.use(bodyParser.json());

//import mongoose model for Users collection

//route to get a user by id and authenticate
router.get('/users/:username', (req, res) => {

});

//route to add a new unique user
router.post('/users', (req, res) => {

});

module.exports = router;
