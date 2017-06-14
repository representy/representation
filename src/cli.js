import program from 'commander';
import fs from 'fs';
import path from 'path';
import logWith from 'log-with';
import ConfigReader from 'representy-tool-config-reader';
import Representy from './representy';
import pkg from '../package.json';

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

logger.debug('Starting to build');
const env = process.env;
const config = ConfigReader.read(program.config, env);
const representy = new Representy(config);
logger.debug('Building');
representy.build()
  .then(() => {
    ls(config.folder);
    logger.debug('Done');
  });
