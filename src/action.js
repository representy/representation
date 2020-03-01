const { getInput } = require('@actions/core');
const representy = require('./representy');

const configPath = getInput('config');
const debug = getInput('debug') === 'true';

representy(configPath, debug);
