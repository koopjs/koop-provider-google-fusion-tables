// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

// Initialize Koop
const Koop = require('koop')
const koop = new Koop()

// Install the trimet Provider
const provider = require('./')
koop.register(provider)

// Start listening for HTTP traffic
const config = require('config')
// Set port for configuration or fall back to default
const port = config.port || 3000

if (process.env.LAMBDA) {
  module.exports = koop.server
} else {
  koop.server.listen(port)
}
