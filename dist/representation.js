'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

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
    this.options = _lodash2.default.extend(Representation.getOptions(), config);
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json'
    };
  }

  write(data) {
    const { folder, file } = this.options;
    const filePath = path.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    _mkdirp2.default.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  }

  build() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const sources = _lodash2.default.chain(_this.options.sources).map((() => {
        var _ref = _asyncToGenerator(function* (option, sourceName) {
          const { Source } = yield Promise.resolve().then(() => require(`representation-source-${sourceName}`));
          const source = new Source(option);
          return source.load();
        });

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })()).value();
      const payload = _lodash2.default.compact((yield Promise.all(sources)));
      _this.write(payload);
    })();
  }

}

exports.default = Representation;