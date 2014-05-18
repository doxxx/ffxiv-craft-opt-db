module.exports = {
  db: {
    mongodb: 'mongodb://localhost/ffxiv-craft-opt-web'
  },
  logger: {
    console: {
      colorize: true,
      timestamp: false
    },
    api: 'logs/api.log',
    exceptions: 'logs/exceptions.log',

    debug: {
      enabled: false,
      filename: 'logs/debug.log'
    }
  }
};
