// backend/worker/eventBus.js

const EventEmitter = require('events');
const logger = require('./logger');

class EventBus extends EventEmitter {
  publish(event, data) {
    logger.debug(`[EventBus] Publish: ${event}`, data);
    this.emit(event, data);
  }

  subscribe(event, callback) {
    logger.debug(`[EventBus] Subscribe: ${event}`);
    this.on(event, callback);
  }

  unsubscribe(event, callback) {
    logger.debug(`[EventBus] Unsubscribe: ${event}`);
    this.off(event, callback);
  }
}

module.exports = new EventBus();
