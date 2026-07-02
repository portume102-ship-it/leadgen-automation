// backend/api/logs.js

const express = require('express');
const logger = require('../worker/logger');

const router = express.Router();

router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

router.get('/', (req, res) => {
  const logList = logger.getLogs();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    execution_time_ms: Date.now() - req.startTime,
    version: '3.0.0',
    logs: logList
  });
});

module.exports = router;
