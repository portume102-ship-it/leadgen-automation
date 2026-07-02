// backend/worker/logger.js

const pino = require('pino');

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

const logBuffer = [];
const MAX_LOGS = 250;

function addBufferLog(level, message, meta) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta: meta ? JSON.stringify(meta) : null
  };
  logBuffer.push(logEntry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift();
  }
}

const logger = {
  info: (msg, meta) => {
    pinoLogger.info(meta || {}, msg);
    addBufferLog('INFO', msg, meta);
  },
  warn: (msg, meta) => {
    pinoLogger.warn(meta || {}, msg);
    addBufferLog('WARN', msg, meta);
  },
  error: (msg, meta) => {
    pinoLogger.error(meta || {}, msg);
    addBufferLog('ERROR', msg, meta);
  },
  debug: (msg, meta) => {
    pinoLogger.debug(meta || {}, msg);
    addBufferLog('DEBUG', msg, meta);
  },
  getLogs: () => logBuffer
};

module.exports = logger;
