'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {Acronym} = require('../models.js');
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js');

const should = chai.should();
chai.use(chaiHttp);

//HELPER FUNCTIONS FOR CREATING TEST DATABASE

//seed test-mad-app database
function seedAcronymData() {
  const seedData = [];
  //loop to create documents that are pushed to seedData
  for (let i = 0; i < 10; i++) {
    seedData.push(createAcronymEntry());
  }
  return Acronym.insertMany(seedData);
}

//create acronym entry
function createAcronymEntry() {
  return {
    userId: faker.name.firstName(),
    acronym: faker.hacker.abbreviation(),
    spellOut: faker.hacker.phrase(),
    definition: faker.lorem.sentence(),
    categoryId: faker.random.uuid()
  }
}

//close test database
function tearDownDb() {
  return mongoose.connection.dropDatabase();
}

describe('Acronym API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedAcronymData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('tests for GET request', function() {
    it('should return all acronym entries', function() {
      let testEntry;
      return chai.request(app)
        .get('/acronyms')
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.not.be.empty;
          res.body.forEach(post => {
            post.should.be.a('object');
            post.should.include.keys('userId', 'acronym', 'spellOut', 'categoryId');
          });
          Acronym.count()
            .then(count => {
              res.body.should.have.length.of(count);
            });
          testEntry = res.body[0];
          Acronym
            .findById(testEntry._id)
            .exec()
            .then(entry => {
              // testEntry._id.should.equal(entry.id);
              testEntry.acronym.should.equal(entry.acronym);
              testEntry.spellOut.should.equal(entry.spellOut);
              testEntry.categoryId.should.equal(entry.categoryId);
            });
        }); //end of outermost then block
    }); //end of it block
  }); //end of GET tests

  describe('tests for POST request', function() {
    it('should create new acronym entry', function() {
      const newEntry = createAcronymEntry();
      return chai.request(app)
        .post('/acronyms')
        .send(newEntry)
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('userId', 'acronym', 'spellOut', 'categoryId');
          res.body.acronym.should.equal(newEntry.acronym);
          res.body.spellOut.should.equal(newEntry.spellOut);
          res.body.categoryId.should.equal(newEntry.categoryId);
          Acronym
            .findById(res.body._id)
            .exec()
            .then(entry => {
              entry.acronym.should.equal(newEntry.acronym);
              entry.spellOut.should.equal(newEntry.spellOut);
              entry.categoryId.should.equal(newEntry.categoryId);
            });
        }); //end of outermost then block
    }); //end of it block
  });//end of POST tests

  describe('tests for PUT request', function() {
    it('should update acronym entry', function() {

    }); //end of it block
  });//end of PUT tests

  describe('tests for DELETE request', function() {
    it('should delete acronym entry', function() {
      let deletedEntry;
      return Acronym
        .findOne()
        .exec()
        .then(entry => {
          deletedEntry = entry;
          return chai.request(app)
            .delete(`/acronyms/${deletedEntry.id}`)
        })
        .then(res => {
          res.should.have.status(204);
          Acronym
            .findById(deletedEntry.id)
            .exec()
            .then(entry => {
              should.not.exist(entry);
            });
        });
    }); //end of it block
  })//end of DELETE test
}); //end of all tests for Acronym API
