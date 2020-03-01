const { execSync } = require('child_process');
const { getLogger, setDebug } = require('./logger');
const getConfig = require('./config');

const logger = getLogger('representy');

module.exports = async (configPath, debug) => {
  setDebug(debug);
  if (debug) {
    logger.debug('Logs are enabled');
  }
  const config = getConfig(configPath);
  logger.debug(config);
  const { components, render } = config;
  const deps = [...new Set([render.theme, ...components
    .map((component) => component.use),
  ].filter(Boolean))];
  if (deps.length) {
    logger.debug('dependencies', deps);
    execSync(`npm i --no-save ${deps.join(' ')}`);
  }
  return Promise.all(components.map(async (component) => {
    const { use: module, with: payload, category } = component;
    if (module) {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      return require(module)(category, payload);
    }
    return {
      payload,
      category,
    };
  }));
};
