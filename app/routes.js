var models = require('./models');
var passport = require('passport');

exports.setup = function(app, handlers) {
  app.post('/login', passport.authenticate('local'), handlers.loginSuccess);
  app.get('/user', handlers.getUser);
  app.get('/chars', handlers.getChars);
  app.get('/chars/:char', handlers.getChar);

  app.param('char', handlers.charParam);
};
