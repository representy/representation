'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logWith = require('log-with');

var _logWith2 = _interopRequireDefault(_logWith);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _representyToolRenderer = require('representy-tool-renderer');

var _representyToolRenderer2 = _interopRequireDefault(_representyToolRenderer);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logWith2.default)(module);

class Representy {
  constructor(config) {
    this.config = _lodash2.default.extend(Representy.getOptions(), config);
    if (this.config.log) {
      logger.level = 'debug';
    }
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json',
      home: 'index.html'
    };
  }

  static clean(folder) {
    logger.debug('Cleaning folder', folder);
    _rimraf2.default.sync(folder);
  }

  static removeTokens(sources) {
    logger.debug('Removing tokens');
    return _lodash2.default.mapValues(sources, source => _lodash2.default.omit(source, 'options.token'));
  }

  static write(folder, data, file) {
    const filePath = _path2.default.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    _mkdirp2.default.sync(_path2.default.dirname(filePath));
    _fs2.default.writeFileSync(filePath, data);
  }

  render(payload) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const { template } = _this.config;

      const layout = template.layout;
      if (!_lodash2.default.isEmpty(layout)) {
        try {
          const layoutModule = `${_package2.default.name}-layout-${layout}`;
          logger.debug('Will use layout rendering', layoutModule);
          const { Template } = yield Promise.resolve().then(() => require(`${layoutModule}`));
          return Template.render(payload);
        } catch (e) {
          logger.error(e.message, e.code);
        }
        return null;
      }

      const file = template.file;
      if (!_lodash2.default.isEmpty(file)) {
        logger.debug('Will use file rendering');
        return _representyToolRenderer2.default.render(payload, _lodash2.default.pick(template, 'file', 'engine'));
      }
      logger.error('config.template', "> Couldn't find any good template config");
      return null;
    })();
  }

  static mapValues(props, fn) {
    return _asyncToGenerator(function* () {
      const values = yield Promise.all(_lodash2.default.map(props, function (options, sourceName) {
        return Promise.resolve(fn(options, sourceName)).then(function (result) {
          return { [sourceName]: { data: result } };
        });
      })).then(function (arr) {
        return arr.reduce(function (memo, result) {
          return _lodash2.default.extend(memo, result);
        }, {});
      });
      return _lodash2.default.merge(props, values);
    })();
  }

  static sourceLoader(source, config, sourceModule) {
    return _asyncToGenerator(function* () {
      try {
        const { Source } = yield Promise.resolve().then(() => require(`${sourceModule}`));
        const fetcher = new Source(_extends({}, source.options, {
          token: _lodash2.default.get(source, 'options.token') || _lodash2.default.get(config.tokens, source.type)
        }));
        return fetcher.load();
      } catch (e) {
        logger.error(e.message, e.code);
        return null;
      }
    })();
  }

  build() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const { config } = _this2;
      const { template } = config;
      const sources = yield Representy.mapValues(template.sources, (() => {
        var _ref = _asyncToGenerator(function* (source, sourceName) {
          if (_lodash2.default.isEmpty(source.type)) {
            return null;
          }
          logger.debug('Loading source', sourceName);
          if (source.type === 'data') {
            return _lodash2.default.get(source, 'data');
          }
          const sourceModule = `${_package2.default.name}-source-${source.type}`;
          return Representy.sourceLoader(source, config, sourceModule);
        });

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })());

      const payload = {
        updatedAt: new Date(),
        sources: Representy.removeTokens(sources)
      };

      const { folder, file, clean, json, home } = _this2.config;

      if (clean) {
        logger.debug('config.clean', '> Clean build folder');
        Representy.clean(folder);
      }
      if (json) {
        logger.debug('config.json', '> Genarate JSON output');
        Representy.write(folder, JSON.stringify(payload, null, 4), file);
      }
      logger.debug('Rendering page');
      const html = yield _this2.render(payload);
      if (!_lodash2.default.isEmpty(html)) {
        Representy.write(folder, html, home);
      } else {
        logger.debug('Rendering failed');
      }
    })();
  }

}

exports.default = Representy;