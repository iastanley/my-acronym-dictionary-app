'use strict';
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

const {Acronym, Category, Color, User} = require('../models');
const colorData = require('../color-data.json');

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

//add the same username to each color document of Color data
function generateUserColors(username, colorArray) {
  const colors = [];
  colorArray.forEach(color => {
    color.username = username;
    colors.push(color);
  });
  return colors;
}

//route to add a new unique user
router.post('/signup', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }
  let {username, password, confirmPassword} = req.body;
  if (!username || !password || !confirmPassword) {
    return res.status(422).send('Missing field');
  }
  if (typeof username !== 'string') {
    return res.status(422).send('Incorrect field type: username');
  }
  username = username.trim();
  if (username === '') {
    return res.redirect('/error');
  }
  if(typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return res.status(422).send('Incorrect field type: password');
  }
  password = password.trim();
  confirmPassword = confirmPassword.trim();
  if (password === '') {
    return res.redirect('/error');
  }
  if (password !== confirmPassword) {
    return res.redirect('/error');
  }

  return User
    .find({username: username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.redirect('/error');
      }
      //seed database with unused colors for new user
      return Color
        .insertMany(generateUserColors(username, colorData));
    })
    //seed new user database with one example acronym
    .then(() => {
      return Color
        .findOneAndUpdate({username: username}, {$set: {used: 'true'}}, {new: true})
        .exec();
    })
    .then(color => {
      return Category
        .create({
          username: username,
          title: 'Example',
          color: color.hexCode
        });
    })
    .then(category => {
      return Acronym
        .create({
          username: username,
          acronym: 'MAD',
          spellOut: 'My Acronym Dictionary',
          definition: 'My Acronym Dictionary helps you keep track of acronyms and abbreviations for various settings. Click the Add Acronym button to get started.',
          categoryId: category.id
        });
    })
    .then(() => {
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

//testing login route
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.redirect('/error');
    }
    req.login(user, function(loginErr) {
      if (loginErr) {return next(loginErr);}
      req.session.username = req.user.username;
      console.log(req.session.username);
      return res.redirect('/main');
    });
  })(req, res, next);
});

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

module.exports = router;
