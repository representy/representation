const { safeLoad } = require('js-yaml');
const { readFileSync } = require('fs');

module.exports = (configPath) => safeLoad(readFileSync(configPath).toString());
