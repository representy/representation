import fs from 'fs';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import path from 'path';
import Renderer from 'representation-tool-renderer';
import rimraf from 'rimraf';

const logger = logWith(module);

class Representation {
  constructor(config) {
    this.config = _.extend(Representation.getOptions(), config);
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json',
      index: 'index.html',
    };
  }

  static clean(folder) {
    rimraf.sync(folder);
  }

  write(data, file) {
    const { folder } = this.config;
    const filePath = path.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
  }

  async render(payload) {
    const { template } = this.config;

    const layout = template.layout;
    if (!_.isEmpty(layout)) {
      const layoutModule = `representation-layout-${layout}`;
      try {
        const { Template } = await import(layoutModule);
        return Template.render(payload);
      } catch (e) {
        logger.error(e.message, e.code);
      }
      return null;
    }

    const file = template.file;
    if (!_.isEmpty(file)) {
      return Renderer.render(payload, _.pick(template, 'file', 'engine'));
    }
    return null;
  }

  static async mapValues(props, fn) {
    const values = await Promise.all(
      _.map(props, (options, sourceName) =>
        Promise
          .resolve(fn(options, sourceName))
          .then(result => ({ [sourceName]: { data: result } }))))
      .then(arr => arr.reduce((memo, result) => _.extend(memo, result), {}));
    return _.merge(props, values);
  }

  async build() {
    const { config } = this;
    const { template } = config;
    const sources = await Representation.mapValues(template.sources,
      async (source) => {
        if (_.isEmpty(source.type)) {
          return null;
        }
        if (source.type === 'data') {
          return _.get(source, 'data');
        }
        const sourceModule = `representation-source-${source.type}`;
        try {
          const { Source } = await import(sourceModule);
          const fetcher = new Source(source.options);
          return fetcher.load();
        } catch (e) {
          logger.error(e.message, e.code);
          return null;
        }
      });

    const payload = {
      updatedAt: new Date(),
      sources,
    };

    if (this.config.clean) {
      Representation.clean(this.config.folder);
    }
    if (this.config.json) {
      this.write(JSON.stringify(payload, null, 4), this.config.file);
    }
    const html = await this.render(payload);
    if (!_.isEmpty(html)) {
      this.write(html, this.config.index);
    }
  }

}

export default Representation;
