'use strict';
const {BasicStrategy} = require('passport-http');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {User} = require('../models');

const router = express.Router();

router.use(express.static('../public'));
router.use(bodyParser.json());

const basicStrategy = new BasicStrategy((username, password, callback) => {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});

passport.use(basicStrategy);
router.use(passport.initialize());

//route to add a new unique user
router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }
  let {username, password, confirmPassword} = req.body;
  if (!username || !password || !confirmPassword) {
    return res.status(422).json({message: 'Missing field'});
  }
  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }
  username = username.trim();
  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }
  if(typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }
  password = password.trim();
  confirmPassword = confirmPassword.trim();
  if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }
  if (password !== confirmPassword) {
    return res.status(422).json({message: 'Confirmation password does not match'});
  }

  return User
    .find({username: username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'Username already taken'});
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash
        });
    })
    .then(() => {
      return res.status(201).redirect('/main');
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error: Users Router'});
    });
});

//just for testing - remove prior to deployment
router.get('/', (req, res) => {
  User
    .find()
    .exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error: Users Router'});
    });
});

// router.get('/main', passport.authenticate('basic', {session: true}), (req, res) => {
//   res.status(200).sendFile(__dirname + '/public/main.html');
// });

module.exports = router;
