import * as fs from 'fs';
import * as ghpages from 'gh-pages';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import * as path from 'path';

const logger = logWith(module);

class Representation {
  constructor(config) {
    this.sources = [];
    let opts = config;
    if (_.isString(config)) {
      opts = {
        folder: config,
      };
    }
    this.fileName = opts.fileName || 'me.json';
    this.folder = opts.folder;
    this.config = opts;
  }

  write(data) {
    const filePath = path.join(process.cwd(), this.folder, this.fileName);
    logger.debug('File created at', filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    return this;
  }

  addSource(source) {
    this.sources.push(source);
    return this;
  }

  async build() {
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

  async generate() {
    await this.build();
    this.write(this.payload || {});
    return this;
  }

  async publish() {
    const promise = new Promise(
      (resolve, reject) => ghpages.publish(this.folder,
        this.config.publish || {},
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }));
    await promise;
    return this;
  }
}

export default Representation;
