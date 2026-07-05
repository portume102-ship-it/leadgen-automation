// backend/api/providers.js

const express = require('express');
const browserManager = require('../worker/browserManager');

const router = express.Router();

router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

router.get('/', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    execution_time_ms: Date.now() - req.startTime,
    version: '3.0.0',
    providers: [
      { id: 'google_maps', name: 'Google Maps Search', status: 'active', type: 'collection' },
      { id: 'google_search', name: 'Google Organic Discovery', status: 'active', type: 'discovery' },
      { id: 'instagram', name: 'Instagram Engagement Profiler', status: 'active', type: 'enrichment' },
      { id: 'website', name: 'Website Auditer', status: 'active', type: 'enrichment' },
      { id: 'facebook', name: 'Facebook Discovery Scraper', status: 'active', type: 'collection' },
      { id: 'reddit', name: 'Reddit Lead Discovery', status: 'active', type: 'discovery' },
      { id: 'linkedin', name: 'LinkedIn via TinyFish Agent', status: 'active', type: 'collection' },
      { id: 'tinyfish_search', name: 'TinyFish Search API', status: 'active', type: 'discovery' },
      { id: 'tinyfish_fetch', name: 'TinyFish Fetch Page Renderer', status: 'active', type: 'discovery' }
    ]
  });
});

module.exports = router;
