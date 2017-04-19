'use strict';
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

const {User, Color} = require('../models');
const colorData = require('../color-data.json');

//add the same username to each color document of Color data
function generateUserColors(username, colorArray) {
  const colors = JSON.parse(colorArray);
  colors.forEach(color => {
    color.user = username;
  });
  return colorArray;
}

//route to add a new unique user
router.post('/signup', (req, res) => {
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
    .then(user => {
      //login after creating new user
      req.login(user, function(err) {
        if (err) {return next(err);}
        req.session.username = req.user.username;
        return res.redirect('/main');
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error: Users Router'});
    });
});

passport.use(new LocalStrategy(function(username, password, done){
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return done(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return done(null, false, {message: 'Incorrect password'});
      }
      else {
        return done(null, user);
      }
    });
}));

//login route
router.post('/login', passport.authenticate('local',
  {
    failureRedirect: '/',
    failureFlash: true
  }), (req, res) => {
    req.session.username = req.user.username;
    res.redirect('/main');
  }
);

//logout route
router.get('/logout', function(req, res){
  req.logout();
  req.session.destroy();//end session
  res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
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

//Example of protected route - this does not help me...
// router.get('/main',
//   passport.authenticate('basic', {session: false}),
//   (req, res) => {
//     res.redirect('/main');
//   });

module.exports = router;
