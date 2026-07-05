// backend/providers/tinyfish/fetch.js

const axios = require('axios');
const logger = require('../../worker/logger');

class TinyFishFetch {
  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY || 'sk-tinyfish-0YxHuvbi-dw9Hfh7ynR7mRI9HixoEoQS';
  }

  async fetchUrls(urls) {
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('An array of urls is required');
    }

    logger.info(`[TinyFish Fetch] Fetching content for ${urls.length} URLs`);
    try {
      const response = await axios.post('https://api.fetch.tinyfish.ai', 
        { urls }, 
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (err) {
      logger.error(`[TinyFish Fetch] Request failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new TinyFishFetch();
