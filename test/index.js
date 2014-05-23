var server = require('../app/server');
var mongoose = require('mongoose');
var models = require('../app/models');
var expect = require('expect.js');
var request = require('supertest');
var _ = require('underscore');

describe('ffxiv-craft-opt-db', function() {
  var user;

  function initData(done) {
    models.User.remove({}, function() {
      models.Synth.remove({}, done);
    });
  }

  function initMongoose(done) {
    mongoose.connect('mongodb://localhost/ffxiv-craft-opt-db_test', function () {
      server.start(2999); // don't clash with running server
      initData(done);
    });
  }

  before(function(done) {
    initMongoose(done);
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(done);
  });

  var agent = request.agent(server.app);
  var exampleChar = {
    name: 'Lucida',
    classes: [
      {
        name: 'Alchemist',
        stats: {
          level: 1,
          craftsmanship: 2,
          control: 3,
          cp: 4,
          actions: [ 'basicSynthesis' ]
        }
      }
    ]
  };
  var exampleSynth = {
    name: 'Test Synth',
    recipe: {
      name: 'Test Recipe',
      cls: 'Alchemist',
      level: 12,
      difficulty: 34,
      durability: 56,
      startQuality: 78,
      maxQuality: 90
    },
    bonusStats: {
      craftsmanship: 1,
      control: 2,
      cp: 3
    },
    sequence: ['basicSynthesis', 'basicTouch'],
    sequenceSettings: {
      debug: false,
      maxMontecarloRuns: 200,
      maxTricksUses: 0,
      reliabilityPercent: 100,
      seed: 0,
      specifySeed: false,
      useConditions: true
    },
    solver: {
      algorithm: 'eaSimple',
      generations: 200,
      penaltyWeight: 10000,
      population: 500
    }
  };
  var charURI,
    synthURI;

  describe('/users', function() {
    it('POST should create a new user', function(done) {
      agent.post('/users')
        .send({username: 'foo@bar.com', password: '123'})
        .expect(200, done);
    });
    it('POST should not create a duplicate user', function (done) {
      agent.post('/users')
        .send({username: 'foo@bar.com', password: '123'})
        .expect(400, done);
    });
    it('POST should not accept username which is not valid email', function (done) {
      agent.post('/users')
        .send({username: 'bob', password: '123'})
        .expect(400, done);
    });
  });
  describe('/chars', function () {
    it('should reject unauthorized access', function (done) {
      agent.get('/chars')
        .expect(401, done);
    });
  });
  describe('/synths', function () {
    it('should reject unauthorized access', function (done) {
      agent.get('/synths')
        .expect(401, done);
    });
  });
  describe('/login', function() {
    it('POST should reject an incorrect username/password', function(done) {
      agent.post('/login')
        .send({username: 'does.not@exist', password: 'blah'})
        .expect(401, done);
    });
    it('POST should accept a correct username and password', function(done) {
      agent.post('/login')
        .send({username: 'foo@bar.com', password: '123'})
        .expect(200, done);
    });
  });
  describe('/chars', function () {
    it('GET should return nothing before characters created', function(done) {
      agent.get('/chars')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).to.empty();
          done();
        });
    });
    it('POST should create character', function(done) {
      agent.post('/chars')
        .send(exampleChar)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.include.keys('name', 'uri');
          expect(res.body.name).to.be(exampleChar.name);
          charURI = '/chars/' + res.body.uri;
          done();
        });
    });
    it('POST should not create duplicate character', function(done) {
      agent.post('/chars')
        .send(exampleChar)
        .expect(400, done);
    });
    it('GET should return character names and URIs after characters created', function(done) {
      agent.get('/chars')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.include.keys('name', 'uri');
          expect(res.body[0].name).to.be(exampleChar.name);
          expect('/chars/' + res.body[0].uri).to.be(charURI);
          done();
        });
    });
  });
  describe('/chars/<id>', function() {
    it('GET should return character details', function(done) {
      agent.get(charURI)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).to.eql(exampleChar);
          done();
        });
    });
    it('PUT should replace character details', function(done) {
      var updatedChar = _.clone(exampleChar);
      updatedChar.name += 'xxx';
      agent.put(charURI)
        .send({ name: updatedChar.name })
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).to.eql(updatedChar);
          done();
        });
    });
    it('DELETE should delete character', function (done) {
      agent.delete(charURI)
        .expect(200, done);
    });
  });
  describe('/synths', function () {
    it('GET should return nothing before synths created', function (done) {
      agent.get('/synths')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.be.empty();
          done();
        });
    });
    it('POST should create synth', function (done) {
      agent.post('/synths')
        .send(exampleSynth)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.include.keys('name', 'uri');
          expect(res.body.name).to.be(exampleSynth.name);
          synthURI = '/synths/' + res.body.uri;
          done();
        });
    });
    it('POST should not create duplicate synth', function (done) {
      agent.post('/synths')
        .send(exampleSynth)
        .expect(400, done);
    });
    it('GET should return synth names and URIs after synths created', function (done) {
      agent.get('/synths')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.include.keys('name', 'uri');
          expect(res.body[0].name).to.be(exampleSynth.name);
          expect('/synths/' + res.body[0].uri).to.be(synthURI);
          done();
        });
    });
  });
  describe('/synths/<id>', function () {
    it('GET should return synth details', function (done) {
      agent.get(synthURI)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.eql(exampleSynth);
          done();
        });
    });
    it('PUT should replace synth details', function (done) {
      var updatedSynth = _.clone(exampleSynth);
      updatedSynth.name += 'xxx';
      updatedSynth.recipe.name += 'xxx';
      agent.put(synthURI)
        .send({
          name: updatedSynth.name,
          recipe: updatedSynth.recipe
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.eql(updatedSynth);
          done();
        });
    });
    it ('DELETE should delete synth', function (done) {
      agent.delete(synthURI)
        .expect(200, done);
    });
  });
});
