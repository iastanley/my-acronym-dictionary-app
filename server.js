'use strict';
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

const usersRouter = require('./routers/usersRouter');
const acronymsRouter = require('./routers/acronymsRouter');
const categoryRouter = require('./routers/categoryRouter');
const colorRouter = require('./routers/colorRouter');
const {PORT, DATABASE_URL} = require('./config.js');
const {User} = require('./models');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.static('public'));

// to allow testing of ajax in local dev environment
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Acess-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Acess-Control-Allow-Headers', 'Content-Type');
  next();
});

passport.use(new LocalStrategy(function(username, password, done){
  User
    .findOne({username: username}, function(err, user) {
      console.log('user: ', user);
      if (err) {return done(err);}
      if (!user) {
        return done(null, false, {message: 'Incorrect username'});
      }
      if (!user.validatePassword(password)) {
        return done(null, false, {message: 'Invalid password'});
      }
      return done(null, user);
    });
}));

app.use(passport.initialize());

app.use('/acronyms', acronymsRouter);
app.use('/categories', categoryRouter);
app.use('/colors', colorRouter);
app.use('/users', usersRouter);

app.post('/login', passport.authenticate('local',
  {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: false
  })
);

app.get('/main', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/main.html');
});

app.use('*', (req, res) => {
  res.status(404).json({message: 'Request not found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Server started on port: ${port}`);
        resolve();
      })
      .on('error', err => {
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
