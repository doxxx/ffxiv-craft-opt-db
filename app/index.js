var config = require('./config');
var winston = require('winston');
var expressWinston = require('express-winston');
var mongoose = require('mongoose');
var server = require('./server');

winston.remove(winston.transports.Console)
  .add(winston.transports.Console, {
    colorize: config.logger.console.colorize,
    timestamp: config.logger.console.timestamp
  });

winston.add(winston.transports.File, {
  filename: config.logger.api
});

winston.handleExceptions(new winston.transports.File({
  filename: config.logger.exceptions
}));

winston.info("logger started. Connecting to MongoDB...");
mongoose.connect(config.db.mongodb, function () {
  winston.info("Successfully connected to MongoDB. Starting web server...");
  mongoose.connection.on('error', function(err) {
    winston.error(err);
  });
  var app = server.start();
  winston.info("Successfully started web server. Waiting for incoming connections...");
});

exports.server = server;
