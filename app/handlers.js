var _ = require('underscore');
var models = require('./models');

module.exports = {
  loginSuccess: function(req, res) {
    res.send(200);
  },

  charParam: function(req, res, next, id) {
    if (!req.user) {
      res.send(401);
    }
    else {
      req.char = req.user.chars.id(id);
      next();
    }
  },
  synthParam: function (req, res, next, id) {
    if (!req.user) {
      res.send(401);
    }
    else {
      req.synth = models.Synth.findById(id, function (err, synth) {
        if (err) {
          res.json(500, err);
        }
        else if (!synth) {
          res.send(404);
        }
        else {
          req.synth = synth;
          next();
        }
      });
    }
  },

  newUser: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
      res.send(400, { error: 'must provide email and password' });
    }
    else {
      models.User.findByEmail(email, function(err, user) {
        if (err) {
          res.json(500, err);
        }
        else if (user) {
          res.json(400, { error: 'invalid email' });
        }
        else {
          models.User.createUser(email, password, function (err, user) {
            if (err) {
              res.json(500, err);
            }
            else if (!user) {
              res.json(400, { error: 'invalid email' });
            }
            else {
              res.send(200);
            }
          });
        }
      });
    }
  },

  createChar: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else {
      var name = req.body.name;
      if (!name) {
        res.send(400);
      }
      else {
        var char = _.findWhere(req.user.chars, { name: name });
        if (char) {
          res.send(400);
        } else {
          req.user.chars.push({ name: name });
          req.user.save(function (err) {
            if (err) {
              res.json(500, err);
            }
            else {
              res.send(200);
            }
          });
        }
      }
    }
  },
  getChars: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else {
      res.json(_.map(req.user.chars, function (char) {
        return '/chars/' + char._id;
      }));
    }
  },
  getChar: function (req, res) {
    if (!req.char) {
      res.send(500);
    }
    else {
      res.json(req.char);
    }
  },
  updateChar: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else if (!req.char) {
      res.send(400);
    }
    else {
      var name = req.body.name;
      if (!name) {
        res.send(400);
      }
      else {
        req.char.name = name;
        req.user.save(function (err) {
          if (err) {
            res.json(500, err);
          }
          else {
            res.send(200, req.char);
          }
        });
      }
    }
  },
  deleteChar: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else if (!req.char) {
      res.send(400);
    }
    else {
      req.char.remove();
      req.user.save(function (err) {
        if (err) {
          res.json(500, err);
        }
        else {
          res.send(200);
        }
      });
    }
  },

  createSynth: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else {
      if (!req.body.name) {
        res.send(400);
      }
      else {
        req.user.findSynthByName(req.body.name, function (err, synth) {
          if (err) {
            res.json(500, err);
          }
          else if (synth) {
            res.send(400);
          }
          else {
            req.user.createSynth(req.body, function (err) {
              if (err) {
                res.json(500, err);
              }
              res.send(200);
            });
          }
        });
      }
    }
  },
  getSynths: function (req, res) {
    if (!req.user) {
      res.send(401);
    }
    else {
      req.user.findAllSynths(function (err, synths) {
        if (err) {
          res.json(500, err);
        }
        else {
          res.json(_.map(synths, function (synth) {
            return '/synths/' + synth._id;
          }));
        }
      });
    }
  },
  getSynth: function (req, res) {
    if (!req.synth) {
      res.send(500);
    }
    else {
      res.json(req.synth);
    }
  },
  updateSynth: function (req, res) {
    if (!req.synth) {
      res.send(500);
    }
    else {
      _.extend(req.synth, req.body);
      req.synth.save(function (err) {
        if (err) {
          res.json(500, err);
        }
        else {
          res.json(req.synth);
        }
      });
    }
  },
  deleteSynth: function (req, res) {
    if (!req.synth) {
      res.send(500);
    }
    else {
      models.Synth.remove({ _id: req.synth._id }, function (err) {
        if (err) {
          res.json(500, err);
        }
        else {
          res.send(200);
        }
      });
    }
  }
};
