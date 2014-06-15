var passport = require('passport');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
}

exports.setup = function(app, handlers) {
  app.post('/users', handlers.newUser);

  app.post('/login', handlers.login);
  app.post('/logout', handlers.logout);

  app.all('/chars', ensureAuthenticated);
  app.post('/chars', handlers.createChar);
  app.get('/chars', handlers.getChars);
  app.get('/chars/:char', handlers.getChar);
  app.put('/chars/:char', handlers.updateChar);
  app.delete('/chars/:char', handlers.deleteChar);

  app.all('/synths', ensureAuthenticated);
  app.post('/synths', handlers.createSynth);
  app.get('/synths', handlers.getSynths);
  app.get('/synths/:synth', handlers.getSynth);
  app.put('/synths/:synth', handlers.updateSynth);
  app.delete('/synths/:synth', handlers.deleteSynth);

  app.param('char', handlers.charParam);
  app.param('synth', handlers.synthParam);
};
