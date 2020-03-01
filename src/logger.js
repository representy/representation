const log4js = require('log4js');

const configuration = {
  appenders: {
    out: {
      type: 'stdout',
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'off',
    },
  },
};

log4js.setDebug = (debug = false) => {
  configuration.categories.default.level = debug
    ? log4js.levels.DEBUG.levelStr
    : log4js.levels.OFF.levelStr;
  log4js.configure(configuration);
};

log4js.setDebug();

module.exports = log4js;
