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
    models.User.createUser('foo@bar.com', '123', function(err, u) {
      if (err) {
        console.error(err.stack);
      }
      else {
        u.chars.push({name:"Lucida"});
        u.save();
        user = u;
      }
      done();
    });
  }

  function initMongoose(done) {
    var dbName = 'ffxiv-craft-opt-db_' + process.env.USER + '_' + os.hostname().replace('.', '_');
    mongoose.connect('mongodb://localhost/' + dbName, function () {
      server.start(2999); // don't clash with running server
      initData(done);
    });
    mongoose.connection.on('error', function(err) {
      winston.error(err);
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

  describe('/login', function() {
    it('should reject an incorrect email/password', function(done) {
      agent.post('/login')
        .send({username: 'does.not@exist', password: 'blah'})
        .expect(401, done);
    });
    it('should accept a correct email and password', function(done) {
      agent.post('/login')
        .send({username: 'foo@bar.com', password: '123'})
        .expect(200, done);
    });
  });
  describe('/chars', function () {
    it('should return character URIs', function(done) {
      var uris = _.map(user.chars, function(c) { return '/chars/' + c._id; });
      agent.get('/chars')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          _.each(uris, function(uri) {
            expect(res.body).to.contain(uri);
          });
          done();
        });
    });
  });
  describe('/chars/<id>', function() {
    it('should return character details', function(done) {
      _.each(user.chars, function(char) {
        agent.get('/chars/' + char._id)
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
