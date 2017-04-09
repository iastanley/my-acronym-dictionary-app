'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js');

const should = chai.should();
chai.use(chaiHttp);


describe('Static Page Loading', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  after(function() {
    return closeServer();
  });

  it('Index should load successfully', function() {
    chai.request(app)
      .get('/')
      .then(res => {
        res.should.have.status(200);
      });
  });
  it('Main page should load successfully', function() {
    chai.request(app)
      .get('/main')
      .then(res => {
        res.should.have.status(200);
      });
  });
}); //end of Static Page Loading tests

//this will move to another test file eventually
describe('Users Route', function() {
  it('POST should send successfully', function() {
    chai.request(app)
      .post('/users')
      .then(res => {
        res.should.have.status(201);
      });
  });
}); //end of Users Route tests
