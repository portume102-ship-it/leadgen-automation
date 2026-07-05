// backend/providers/tinyfish/search.js

const axios = require('axios');
const logger = require('../../worker/logger');

class TinyFishSearch {
  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY || 'sk-tinyfish-0YxHuvbi-dw9Hfh7ynR7mRI9HixoEoQS';
  }

  async search(query, options = {}) {
    logger.info(`[TinyFish Search] Querying search API: "${query}"`);
    try {
      const targetUrl = 'https://api.search.tinyfish.ai';
      const params = {
        query,
        language: options.language || 'en',
        page: options.page || '0'
      };

      if (options.location && options.location !== 'global') {
        params.location = options.location;
      }

      const response = await axios.get(targetUrl, {
        params,
        headers: {
          'X-API-Key': this.apiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (err) {
      logger.error(`[TinyFish Search] Request failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new TinyFishSearch();
