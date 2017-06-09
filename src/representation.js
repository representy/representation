import * as fs from 'fs';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import * as path from 'path';

const logger = logWith(module);

class Representation {
  constructor(config) {
    this.options = _.extend(Representation.getOptions(), config);
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json',
    };
  }

  write(data) {
    const { folder, file } = this.options;
    const filePath = path.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  }

  async build() {
    const sources = _.chain(this.options.sources)
      .map(async (option, sourceName) => {
        const { Source } = await import(`representation-source-${sourceName}`);
        const source = new Source(option);
        return source.load();
      })
      .value();
    const payload = _.compact(await Promise.all(sources));
    this.write(payload);
  }

}

export default Representation;
