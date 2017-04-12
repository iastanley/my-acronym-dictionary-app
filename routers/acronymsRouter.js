'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Acronym, Category} = require('../models');

router.use(bodyParser.json());

//get all acronyms
router.get('/', (req, res) => {
  Acronym
    .find()
    .exec()
    .then(acronyms => {
      res.status(200).json(acronyms.map(acronym => acronym.apiResponse()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.post('/', (req, res) => {
  //validate required fields
  const requiredFields = ['acronym', 'spellOut', 'categoryTitle'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  let newData = {
    userId: req.body.userId || 'defaultUser',
    acronym: req.body.acronym,
    spellOut: req.body.spellOut,
    definition: req.body.definition || '',
  }

  Category
    .findOne({title: req.body.categoryTitle})
    .exec()
    .then(category => {
      if (category) {
        newData.categoryId = category.id;
        Acronym
          .create(newData)
          .then(acronym => {
            res.status(201).json(acronym.apiResponse());
          });
      } else {
        Category
          .create({
            title: req.body.categoryTitle,
            color: '#00ff00'
          })
          .then(category => {
            newData.categoryId = category.id;
            Acronym
              .create(newData)
              .then(acronym => {
                res.status(201).json(acronym.apiResponse());
              });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error at Acronym POST route'});
    })
});

router.put('/:id', (req, res) => {
  //verify that req.params.id and req.body.id match
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Path id: ${req.params.id} and request body id: ${req.body.id} don't match`;
    console.error(message);
    res.status(400).json({message: message});
  }
  //create object for PUT request
  const updatesToAcronym = {};
  const updateFields = ['acronym', 'spellOut', 'definition', 'categoryId'];
  updateFields.forEach(field => {
    if (field in req.body) {
      updatesToAcronym[field] = req.body[field];
    }
  });

  Acronym
    .findByIdAndUpdate(req.params.id, {$set: updatesToAcronym}, {new: true})
    .exec()
    .then(acronym => res.status(200).json(acronym.apiResponse()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/:id', (req, res) => {
  Acronym
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
