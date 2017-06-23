'use strict';
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

const app = express();

const usersRouter = require('./routers/usersRouter');
const acronymsRouter = require('./routers/acronymsRouter');
const categoryRouter = require('./routers/categoryRouter');
const colorRouter = require('./routers/colorRouter');
const {PORT, DATABASE_URL} = require('./config.js');
const {User} = require('./models');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.static('public')); //index.html will be loaded here
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

//Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({url: DATABASE_URL})
}));

// Passport initializ
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}

//to allow testing of ajax in local dev environment
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Acess-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Acess-Control-Allow-Headers', 'Content-Type');
//   next();
// });

app.use('/users', usersRouter);
app.use('/colors', colorRouter);
app.use('/acronyms', acronymsRouter);
app.use('/categories', categoryRouter);

//route for login error messages
app.get('/error', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/indexerror.html');
});

//main route to display user data
app.get('/main', ensureAuthenticated, (req, res) => {
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
