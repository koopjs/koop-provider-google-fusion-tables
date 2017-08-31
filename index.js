const pkg = require('./package.json')
const provider = {
  name: 'fusion-tables',
  hosts: false,
  Model: require('./model'),
  version: pkg.version,
  type: 'provider'
}

module.exports = provider
