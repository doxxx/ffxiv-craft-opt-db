var os = require('os');
var winston = require('winston');
var server = require('../app/server');
var mongoose = require('mongoose');
var models = require('../app/models');
var expect = require('expect.js');
var request = require('supertest');
var _ = require('underscore');

describe('ffxiv-craft-opt-db', function() {
  var user;

  function initWinston() {
    winston.remove(winston.transports.Console);
    winston.handleExceptions(new winston.transports.Console());
  }

  function initData(done) {
    models.User.remove({}, function() {
      models.Synth.remove({}, done);
    });
  }

  function initMongoose(done) {
    mongoose.connect('mongodb://localhost/ffxiv-craft-opt-db_test', function () {
      mongoose.connection.on('error', function(err) {
        winston.error(err);
      });
      server.start(2999); // don't clash with running server
      initData(done);
    });
  }

  before(function(done) {
    initWinston();
    initMongoose(done);
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(done);
  });

  var agent = request.agent(server.app);
  var charURIs = [],
    chars = {},
    synthURIs = [],
    synths = {};

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
        .send({ name: 'Lucida' })
        .expect(200, done);
    });
    it('POST should not create duplicate character', function(done) {
      agent.post('/chars')
        .send({ name: 'Lucida' })
        .expect(400, done);
    });
    it('GET should return character URIs', function(done) {
      agent.get('/chars')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          expect(res.body).to.have.length(1);
          charURIs = res.body;
          done();
        });
    });
  });
  describe('/chars/<id>', function() {
    it('GET should return character details', function(done) {
      _.each(charURIs, function(uri) {
        agent.get(uri)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body).to.include.keys('_id', 'name', 'classes');
            chars[uri] = res.body;
            done();
          });
      });
    });
    it('PUT should replace character details', function(done) {
      _.each(charURIs, function(uri) {
        var newName = chars[uri].name + 'xxx';
        agent.put(uri)
          .send({ name: newName })
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body).to.include.keys('_id', 'name', 'classes');
            expect(res.body.name).to.be(newName);
            done();
          });
      });
    });
    it('DELETE should delete character', function (done) {
      _.each(charURIs, function (uri) {
        agent.delete(uri)
          .expect(200, done);
      });
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
        .send({ name: 'test' })
        .expect(200, done);
    });
    it('POST should not create duplicate synth', function (done) {
      agent.post('/synths')
        .send({ name: 'test' })
        .expect(400, done);
    });
    it('GET should return synth URIs after synths created', function (done) {
      agent.get('/synths')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.have.length(1);
          synthURIs = res.body;
          done();
        });
    });
  });
  describe('/synths/<id>', function () {
    it('GET should return synth details', function (done) {
      _.each(synthURIs, function (uri) {
        agent.get(uri)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            expect(res.body).to.include.keys('_id', 'name');
            synths[uri] = res.body;
            done();
          });
      });
    });
    it('PUT should replace synth details', function (done) {
      _.each(synthURIs, function (uri) {
        agent.put(uri)
          .send({ recipeName: 'test recipe' })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            expect(res.body).to.include.keys('_id', 'name', 'recipeName');
            expect(res.body.name).to.be('test');
            expect(res.body.recipeName).to.be('test recipe');
            done();
          });
      });
    });
    it ('DELETE should delete synth', function (done) {
      _.each(synthURIs, function (uri) {
        agent.delete(uri)
          .expect(200, done);
      });
    });
  });
});
