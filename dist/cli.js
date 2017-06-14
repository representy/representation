'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logWith = require('log-with');

var _logWith2 = _interopRequireDefault(_logWith);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _representyToolConfigReader = require('representy-tool-config-reader');

var _representyToolConfigReader2 = _interopRequireDefault(_representyToolConfigReader);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _representy = require('./representy');

var _representy2 = _interopRequireDefault(_representy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, _logWith2.default)(module);

_commander2.default.version(_package2.default.version).option('-c, --config [path]', 'Set config path. defaults to ./config.yml').option('-l, --log', 'Log everything').parse(process.argv);

if (_commander2.default.log) {
  logger.level = 'debug';
}
const ls = folder => {
  const dir = _path2.default.resolve(process.cwd(), folder);
  logger.debug('Listing files');
  _fs2.default.readdirSync(dir).forEach(file => {
    logger.debug(`${folder}/${file}`);
  });
};

logger.info('Running');
const env = process.env;
const config = _representyToolConfigReader2.default.read(_commander2.default.config, env);
config.log = _commander2.default.log;
const representy = new _representy2.default(config);
logger.debug('Building');
representy.build().then(() => {
  ls(config.folder);
  logger.info('Done');
});