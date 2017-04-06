'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server.js');

const should = chai.should();
chai.use(chaiHttp);

describe('All Routes', function() {
  it('should send successfully', function() {
    chai.request(app)
      .get('/')
      .then(res => {
        res.should.have.status(200);
      });
  });
}); //end of describe
