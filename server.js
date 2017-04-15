const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

const usersRouter = require('./routers/usersRouter');
const acronymsRouter = require('./routers/acronymsRouter');
const categoryRouter = require('./routers/categoryRouter');
const colorRouter = require('./routers/colorRouter');
const {PORT, DATABASE_URL} = require('./config.js');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.static('public'));

// to allow testing of ajax in local dev environment
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Acess-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Acess-Control-Allow-Headers', 'Content-Type');
//   next();
// });


app.use('/acronyms', acronymsRouter);
app.use('/categories', categoryRouter);
app.use('/colors', colorRouter);

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
