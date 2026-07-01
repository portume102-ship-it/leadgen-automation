// backend/index.js

require('dotenv').config();

const express = require('express');
const logger = require('./worker/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Log incoming request metadata
app.use((req, res, next) => {
  logger.info(`[API] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'lead-intelligence-backend-v3'
  });
});

// Root stats endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Lead Intelligence SaaS Backend V3',
    version: '3.0.0',
    status: 'online'
  });
});

app.use((err, req, res, next) => {
  logger.error(`[Error Handler] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message
  });
});

app.listen(PORT, () => {
  logger.info(`🌐 V3 Backend Service running on port ${PORT}`);
  logger.info('🚀 Base directories, configurations, loggers and repositories initialized.');
});
