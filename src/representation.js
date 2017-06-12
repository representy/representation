import * as fs from 'fs';
import _ from 'lodash';
import logWith from 'log-with';
import mkdirp from 'mkdirp';
import * as path from 'path';
import Renderer from 'representation-tool-renderer';

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

  write(data, file) {
    const { folder } = this.options;
    const filePath = path.join(process.cwd(), folder, file);
    logger.debug('File created at', filePath);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
  }

  async render(payload) {
    const {
      template,
    } = this.options;

    if (_.isString(template)) {
      const templateModule = `representation-template-${template}`;
      try {
        const { Template } = await import(templateModule);
        return Template.render(payload);
      } catch (e) {
        logger.error('Module not found', templateModule);
      }
      return null;
    }

    return Renderer.render(payload, template);
  }

  async build() {
    const { options } = this;
    const sources = _.chain(options.sources)
      .map(async (option, sourceName) => {
        const sourceModule = `representation-source-${sourceName}`;
        try {
          const { Source } = await import(sourceModule);
          const source = new Source(option);
          return source.load();
        } catch (e) {
          logger.error('Module not found', sourceModule);
          return null;
        }
      })
      .compact()
      .value();
    const payload = {
      updatedAt: new Date(),
      profile: options.profile,
      sources: _.compact(await Promise.all(sources)),
    };
    if (!this.options.json) {
      this.write(JSON.stringify(payload, null, 4));
    }
    const html = await this.render(payload);
    if (!_.isEmpty(html)) {
      this.write(html, 'index.html');
    }
  }

}

export default Representation;
