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
  console.log('seeding acronym data');
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
  console.log('Deleting test-mad-app database');
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
            .findById(testEntry.id)
            .exec()
            .then(entry => {
              testEntry.id.should.equal(entry.id);
              testEntry.acroynm.should.equal(entry.acronym);
              testEntry.spellOut.should.equal(entry.acronym);
              testEntry.categoryId.should.equal(entry.categoryId);
            });
        }); //end of outermost then block
    }); //end of it block
  }); //end of GET tests
}); //end of all tests for Acronym API
