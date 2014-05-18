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
    var dbName = 'ffxiv-craft-opt-db_' + process.env.USER + '_' + os.hostname().replace('.', '_');
    mongoose.connect('mongodb://localhost/' + dbName, function () {
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
  var charURIs;

  describe('/users', function() {
    it('PUT should create a new user', function(done) {
      agent.put('/users')
        .send({email: 'foo@bar.com', password: '123'})
        .expect(200, done);
    });
    it('PUT should not create a duplicate user', function (done) {
      agent.put('/users')
        .send({email: 'foo@bar.com', password: '123'})
        .expect(400, done);
    });
  });
  describe('/login', function() {
    it('POST should reject an incorrect email/password', function(done) {
      agent.post('/login')
        .send({username: 'does.not@exist', password: 'blah'})
        .expect(401, done);
    });
    it('POST should accept a correct email and password', function(done) {
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
    it('PUT should create character', function(done) {
      agent.put('/chars')
        .send({ name: 'Lucida' })
        .expect(200, done);
    });
    it('GET should return character URI', function(done) {
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
      _.each(charURIs, function(char) {
        agent.get(charURIs)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body).to.include.keys('_id', 'name', 'classes');
            done();
          });
      });
    });
  });
});
