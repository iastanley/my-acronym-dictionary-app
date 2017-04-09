const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

const usersRouter = require('./usersRouter');
const acronymsRouter = require('./acronymsRouter');
const {PORT, DATABASE_URL} = require('./config.js');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.static('public'));

app.use('/acronyms', acronymsRouter);

app.get('/main', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/main.html');
});

app.post('/users', (req, res) => {
  res.status(201).redirect('/main');
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
