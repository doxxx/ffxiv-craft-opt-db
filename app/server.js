var _ = require('underscore');
var config = require('./config');
var winston = require('winston');
var express = require('express');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');
var routes = require('./routes');
var models = require('./models');
var handlers = require('./handlers');

var app = express();

if (config.logger.debug.enabled) {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.File({
        filename: config.logger.debug.filename
      })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}" // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  }));
}

app.use(bodyParser());
app.use(cookieParser());
app.use(session({secret: 'funky chicken'}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function(username, password, done) {
  models.User.findOne({email: username}, function(err, user) {
    if (err) return done(err);
    if (!user || !user.validatePassword(password)) {
      return done(null, false, { message: 'Invalid login' });
    }
    return done(null, user);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err, user) {
    done(err, user);
  });
});

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.allowedDomains);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
};

app.use(allowCrossDomain);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      timestamp: true,
      colorize: true
    })
  ],
  statusLevel: true
}));

function start(port) {
  models.initData();
  routes.setup(app, handlers);
  app.listen(port || process.env.PORT || 3000);
  return app;
}

exports.start = start;
exports.app = app;
