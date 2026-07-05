// backend/providers/tinyfish/provider.js

const logger = require('../../worker/logger');
const tfSearch = require('./search');
const tfFetch = require('./fetch');

class TinyFishProvider {
  constructor() {
    this.name = 'tinyfish';
    this.scrapedResults = [];
  }

  async search(page, query) {
    // Pure HTTP operation, bypass browser context entirely
    logger.info(`[TinyFish Provider] Performing search for keyword: "${query.keyword}"`);
    const results = await tfSearch.search(query.keyword, {
      location: query.city
    });
    this.scrapedResults = results || [];
  }

  async collect(page, maxLeads) {
    const list = Array.isArray(this.scrapedResults) ? this.scrapedResults : [];
    this.scrapedResults = list.slice(0, maxLeads);
    return this.scrapedResults.length;
  }

  async extract(page, cardIndex) {
    const item = this.scrapedResults && this.scrapedResults[cardIndex];
    if (!item) return null;

    return {
      name: item.title || item.name || 'Unknown Business',
      website: item.url || item.website || '',
      snippet: item.snippet || item.description || '',
      raw_source: item
    };
  }

  normalize(raw, city) {
    return {
      name: raw.name,
      website: raw.website,
      city: city || '',
      notes: raw.snippet || '',
      source: 'tinyfish_search',
      status: 'new'
    };
  }
}

module.exports = TinyFishProvider;
