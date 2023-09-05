const logger = require('gk-logger')()
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();


module.exports = {
  logger,
  eventEmitter
}