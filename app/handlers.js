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
      console.log('newUser: ' + email);
      models.User.create({email: email}, function (err, user) {
        if (err) {
          res.json(500, err);
        }
        else if (!user) {
          res.json(500, { error: 'invalid email' });
        }
        else {
          res.json(user);
        }
      });
    }
  },
  getUser: function (req, res) {
    if (req.user) {
      res.send(req.user);
    }
    else {
      res.send(401);
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
  }
};
