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
  newUser: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
      res.send(400);
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
  }
};
