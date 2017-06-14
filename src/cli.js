import program from 'commander';
import fs from 'fs';
import logWith from 'log-with';
import path from 'path';
import ConfigReader from 'representy-tool-config-reader';
import pkg from '../package.json';
import Representy from './representy';

const logger = logWith(module);

program
  .version(pkg.version)
  .option('-c, --config [path]', 'Set config path. defaults to ./config.yml')
  .option('-l, --log', 'Log everything')
  .parse(process.argv);

if (program.log) {
  logger.level = 'debug';
}
const ls = (folder) => {
  const dir = path.resolve(process.cwd(), folder);
  logger.debug('Listing files');
  fs.readdirSync(dir).forEach((file) => {
    logger.debug(`${folder}/${file}`);
  });
};

logger.info('Running');
const env = process.env;
const config = ConfigReader.read(program.config, env);
config.log = program.log;
const representy = new Representy(config);
logger.debug('Building');
representy.build()
  .then(() => {
    ls(config.folder);
    logger.info('Done');
  });
