// Static endpoint to check server status
const pkg = require('../../package.json');

const { name, version } = pkg;

module.exports.handler = () => {
  return { name, version };
};
