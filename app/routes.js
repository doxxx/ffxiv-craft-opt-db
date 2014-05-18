var passport = require('passport');

exports.setup = function(app, handlers) {
  app.post('/users', handlers.newUser);

  app.post('/login', passport.authenticate('local'), handlers.loginSuccess);

  app.post('/chars', handlers.createChar);
  app.get('/chars', handlers.getChars);
  app.get('/chars/:char', handlers.getChar);
  app.put('/chars/:char', handlers.updateChar);

  app.post('/synths', handlers.createSynth);
  app.get('/synths', handlers.getSynths);
  app.get('/synths/:synth', handlers.getSynth);
  app.put('/synths/:synth', handlers.updateSynth);
  app.delete('/synths/:synth', handlers.deleteSynth);

  app.param('char', handlers.charParam);
  app.param('synth', handlers.synthParam);
};
