var mongoose = require('mongoose');

var classSchema = mongoose.Schema({
  name: String,
  stats: {
    level: Number,
    craftsmanship: Number,
    control: Number,
    cp: Number,
    actions: [String]
  }
});

var charSchema = mongoose.Schema({
  name: String,
  classes: [classSchema]
});

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  chars: [charSchema]
});

userSchema.index({email: 1});

userSchema.methods.validatePassword = function(password) {
  return this.password === password;
};

userSchema.statics.findByEmail = function(email, cb) {
  var User = this.model('User');
  User.findOne({email: email}).exec(function (err, user) {
    if (err) {
      if (cb) cb(err, null);
    }
    else {
      if (cb) cb(null, user);
    }
  });
};

userSchema.statics.createUser = function(email, password, cb) {
  var User = this.model('User');
  var user = new User({ email: email, password: password });
  user.save(function (err) {
    if (err) {
      if (cb) cb(err, null);
    }
    else {
      if (cb) cb(null, user);
    }
  });
};

var synthSchema = mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  name: String,
  recipeName: String,
  level: Number,
  difficulty: Number,
  durabilty: Number,
  max_quality: Number
});

synthSchema.index({user_id: 1, name: 1});

exports.User = mongoose.model('User', userSchema);
exports.Synth = mongoose.model('Synth', synthSchema);

exports.initData = function() {
};
