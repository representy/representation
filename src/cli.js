const program = require('commander');
const log4js = require('./logger');
const representy = require('./representy');
const pkg = require('../package.json');

const logger = log4js.getLogger('cli');

program
  .version(pkg.version)
  .option('-c, --config [path]', 'Set config path. defaults to ./config.yml', './config.yml')
  .option('-d, --debug', 'Log everything')
  .parse(process.argv);

representy(program.config, program.debug)
  .then((result) => {
    logger.info(result);
  })
  .catch((err) => logger.error(err));
