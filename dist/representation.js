'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _ghPages = require('gh-pages');

var ghpages = _interopRequireWildcard(_ghPages);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logWith = require('log-with');

var _logWith2 = _interopRequireDefault(_logWith);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logWith2.default)(module);

class Representation {
  constructor(config) {
    this.sources = [];
    let opts = config;
    if (_lodash2.default.isString(config)) {
      opts = {
        folder: config
      };
    }
    this.fileName = opts.fileName || 'me.json';
    this.folder = opts.folder;
    this.config = opts;
  }

  write(data) {
    const filePath = path.join(process.cwd(), this.folder, this.fileName);
    logger.debug('File created at', filePath);
    _mkdirp2.default.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    return this;
  }

  addSource(source) {
    this.sources.push(source);
    return this;
  }

  build() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const sources = _lodash2.default.map(_this.sources, (() => {
        var _ref = _asyncToGenerator(function* (source) {
          try {
            return source.load();
          } catch (e) {
            return null;
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());
      _this.payload = _lodash2.default.compact((yield Promise.all(sources)));
      return _this;
    })();
  }

  generate() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.build();
      _this2.write(_this2.payload || {});
      return _this2;
    })();
  }

  publish() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const promise = new Promise(function (resolve, reject) {
        return ghpages.publish(_this3.folder, _this3.config.publish || {}, function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
      yield promise;
      return _this3;
    })();
  }
}

exports.default = Representation;