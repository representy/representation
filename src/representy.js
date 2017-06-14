import fs from 'fs';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import path from 'path';
import Renderer from 'representy-tool-renderer';
import rimraf from 'rimraf';
import pkg from '../package.json';

const logger = logWith(module);

class Representy {
  constructor(config) {
    this.config = _.extend(Representy.getOptions(), config);
    if (this.config.log) {
      logger.level = 'debug';
    }
  }

  static getOptions() {
    return {
      folder: 'build',
      file: 'me.json',
      home: 'index.html',
    };
  }

  static clean(folder) {
    logger.debug('Cleaning folder', folder);
    rimraf.sync(folder);
  }

  static removeTokens(sources) {
    logger.debug('Removing tokens');
    return _.mapValues(sources, source => _.omit(source, 'options.token'));
  }

  static write(folder, data, file) {
    const filePath = path.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
  }

  async render(payload) {
    const { template } = this.config;

    const layout = template.layout;
    if (!_.isEmpty(layout)) {
      logger.debug('Will use layout rendering');
      const layoutModule = `${pkg.name}-layout-${layout}`;
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
      logger.debug('Will use file rendering');
      return Renderer.render(payload, _.pick(template, 'file', 'engine'));
    }
    logger.error('config.template', "> Couldn't find any good template config");
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
    const sources = await Representy.mapValues(template.sources,
      async (source, sourceName) => {
        if (_.isEmpty(source.type)) {
          return null;
        }
        logger.debug('Loading source', sourceName);
        if (source.type === 'data') {
          return _.get(source, 'data');
        }
        const sourceModule = `${pkg.name}-source-${source.type}`;
        try {
          const { Source } = await import(sourceModule);
          const fetcher = new Source({
            ...source.options,
            token: source.options.token || _.get(config.token, source.type),
          });
          return fetcher.load();
        } catch (e) {
          logger.error(e.message, e.code);
          return null;
        }
      });

    const payload = {
      updatedAt: new Date(),
      sources: Representy.removeTokens(sources),
    };

    const { folder, file, clean, json, home } = this.config;

    if (clean) {
      logger.debug('config.clean', '> Clean build folder');
      Representy.clean(folder);
    }
    if (json) {
      logger.debug('config.json', '> Genarate JSON output');
      Representy.write(folder, JSON.stringify(payload, null, 4), file);
    }
    logger.debug('Rendering page');
    const html = await this.render(payload);
    if (!_.isEmpty(html)) {
      Representy.write(folder, html, home);
    } else {
      logger.debug('Rendering failed');
    }
  }

}

export default Representy;
