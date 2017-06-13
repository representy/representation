'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _representationToolRenderer = require('representation-tool-renderer');

var _representationToolRenderer2 = _interopRequireDefault(_representationToolRenderer);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logWith2.default)(module);

class Representation {
  constructor(config) {
    this.config = _lodash2.default.extend(Representation.getOptions(), config);
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json',
      index: 'index.html'
    };
  }

  static clean(folder) {
    _rimraf2.default.sync(folder);
  }

  write(data, file) {
    const { folder } = this.config;
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
        const layoutModule = `representation-layout-${layout}`;
        try {
          const { Template } = yield Promise.resolve().then(() => require(`${layoutModule}`));
          return Template.render(payload);
        } catch (e) {
          logger.error(e.message, e.code);
        }
        return null;
      }

      const file = template.file;
      if (!_lodash2.default.isEmpty(file)) {
        return _representationToolRenderer2.default.render(payload, _lodash2.default.pick(template, 'file', 'engine'));
      }
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

  build() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const { config } = _this2;
      const { template } = config;
      const sources = yield Representation.mapValues(template.sources, (() => {
        var _ref = _asyncToGenerator(function* (source) {
          if (_lodash2.default.isEmpty(source.type)) {
            return null;
          }
          if (source.type === 'data') {
            return _lodash2.default.get(source, 'data');
          }
          const sourceModule = `representation-source-${source.type}`;
          try {
            const { Source } = yield Promise.resolve().then(() => require(`${sourceModule}`));
            const fetcher = new Source(source.options);
            return fetcher.load();
          } catch (e) {
            logger.error(e.message, e.code);
            return null;
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());

      const payload = {
        updatedAt: new Date(),
        sources
      };

      if (_this2.config.clean) {
        Representation.clean(_this2.config.folder);
      }
      if (_this2.config.json) {
        _this2.write(JSON.stringify(payload, null, 4), _this2.config.file);
      }
      const html = yield _this2.render(payload);
      if (!_lodash2.default.isEmpty(html)) {
        _this2.write(html, _this2.config.index);
      }
    })();
  }

}

exports.default = Representation;