'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.Promise = global.Promise;

const {Acronym, Category, Color} = require('../models');

router.use(bodyParser.json());

let currentUser;

//get all acronyms
router.get('/', (req, res) => {
  if (req.session && req.session.username) {
    currentUser = req.session.username;
  } else {
    //for unit tests
    currentUser = 'testUser';
  }
  Acronym
    .find({username: currentUser})
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
      return res.status(400).json({message: message});
    }
  });

  let newData = {
    username: currentUser,
    acronym: req.body.acronym,
    spellOut: req.body.spellOut,
    definition: req.body.definition || '',
  }

  Category
    .findOne({username: currentUser, title: req.body.categoryTitle})
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
        //randomly select one of the available colors
        let hexCode = '';
        Color
          .find({username: currentUser, used: 'false'})
          .exec()
          .then(colors => {
            if (!colors.length) {
              res.status(400).json({message: 'Category limit reached'});
            } else {
              let randomIndex = Math.floor(Math.random() * colors.length);
              hexCode = colors[randomIndex].hexCode;
              //used colors are no longer available for new Categories
              Color
                .findByIdAndUpdate(
                  colors[randomIndex].id,
                  {$set: {used: 'true'}}
                )
                .exec();
              //create a new category using the hexCode from randomly selected color
              Category
                .create({
                  username: currentUser,
                  title: req.body.categoryTitle,
                  color: hexCode
                })
                .then(category => {
                  newData.categoryId = category.id;
                  //create acronym using newly created Category's id
                  Acronym
                    .create(newData)
                    .then(acronym => {
                      res.status(201).json(acronym.apiResponse());
                    });
                })
                .catch(err => {
                  console.error(err);
                  res.status(500).json({message: 'Internal server error at Acronym Router - POST'});
                });
            }
          });//end of first Color.then block
      } //end of else block
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
  const updateFields = ['acronym', 'spellOut', 'definition'];
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
    .then(acronym => {
      let categoryId = acronym.categoryId;
      Acronym
        .find({categoryId: categoryId})
        .exec()
        .then(acronyms => {
          if (acronyms.length) {
            res.status(204).end();
          } else {
            Category
              .findByIdAndRemove(categoryId)
              .exec()
              .then(category => {
                Color
                  .findOneAndUpdate(
                    {username: currentUser, hexCode: category.color},
                    {$set: {used: 'false'}}
                  )
                  .exec()
                  .then(() => {
                    res.status(204).end()
                  });
              })
              .catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
              });
          }
        }); //end of second then block
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
