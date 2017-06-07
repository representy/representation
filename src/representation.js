import * as fs from 'fs';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import * as path from 'path';

const logger = logWith(module);

class Representation {
  constructor() {
    this.sources = [];
  }

  static write(data, file) {
    const filePath = path.join(__dirname, file);
    logger.debug('File created at', filePath);
    mkdirp(path.dirname(filePath), (err) => {
      if (err) {
        throw err;
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    });
  }

  addSource(source) {
    this.sources.push(source);
    return this;
  }

  async load() {
    const sources = _.map(this.sources, async (source) => {
      try {
        return source.load();
      } catch (e) {
        return null;
      }
    });
    this.payload = _.compact(await Promise.all(sources));
    return this;
  }

  async build() {
    await this.load();
    return this;
  }

  async generate(file) {
    await this.build();
    const result = this.payload || {};
    Representation.write(result, file);
    return result;
  }
}

export default Representation;
