'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {Acronym, Category} = require('../models.js');
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

//create acronym entry - for direct insertion in mongoDB db
function createAcronymEntry() {
  return {
    userId: faker.name.firstName(),
    acronym: faker.hacker.abbreviation(),
    spellOut: faker.hacker.phrase(),
    definition: faker.lorem.sentence(),
    categoryId: faker.random.uuid()
  }
}

function createPostData() {
  return {
    acronym: faker.hacker.abbreviation(),
    spellOut: faker.hacker.phrase(),
    definition: faker.lorem.sentence(),
    categoryTitle: faker.lorem.word()
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
          res.body.forEach(entry => {
            entry.should.be.a('object');
            entry.should.include.keys('userId', 'acronym', 'spellOut', 'categoryId');
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
              testEntry.acronym.should.equal(entry.acronym);
              testEntry.spellOut.should.equal(entry.spellOut);
              testEntry.categoryId.should.equal(entry.categoryId);
            });
        }); //end of outermost then block
    }); //end of it block
  }); //end of GET tests

  describe('tests for POST request', function() {
    it('should create new acronym entry', function() {
      const newEntry = createPostData();
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
          // res.body.categoryId.should.equal(newEntry.categoryId);
          Acronym
            .findById(res.body.id)
            .exec()
            .then(entry => {
              entry.acronym.should.equal(newEntry.acronym);
              entry.spellOut.should.equal(newEntry.spellOut);
              // let categoryId = entry.categoryId;
              // Category
              //   .findById(categoryId)
              //   .exec()
              //   .then(category => {
              //     console.log('category', category);
              //     category.title.should.equal(newEntry.categoryTitle);
              //   });
            });

        }); //end of outermost then block
    }); //end of it block
  });//end of POST tests

  describe('tests for PUT request', function() {
    it('should update acronym entry', function() {
      const updateData = {
        acronym: 'TEST',
        spellOut: 'This Is A Test',
        categoryId: '1234'
      }

      return Acronym
        .findOne()
        .exec()
        .then(entry => {
          updateData.id = entry.id;
          return chai.request(app)
            .put(`/acronyms/${updateData.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('acronym', 'spellOut', 'definition', 'categoryId');
          res.body.id.should.equal(updateData.id);
          res.body.acronym.should.equal(updateData.acronym);
          res.body.spellOut.should.equal(updateData.spellOut);
          res.body.categoryId.should.equal(updateData.categoryId);
          Acronym
            .findById(updateData.id)
            .exec()
            .then(entry => {
              entry.id.should.equal(updateData.id);
              entry.acronym.should.equal(updateData.acronym);
              entry.spellOut.should.equal(updateData.spellOut);
              entry.categoryId.should.equal(updateData.categoryId);
            });
        });
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
