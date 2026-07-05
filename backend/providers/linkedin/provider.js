// backend/providers/linkedin/provider.js

const logger = require('../../worker/logger');
const tinyfishAgent = require('./viaTinyfishAgent');

class LinkedInProvider {
  constructor() {
    this.name = 'linkedin';
    this.scrapedProfiles = [];
  }

  async search(page, query) {
    logger.info(`[LinkedIn Provider] Triggering TinyFish Agent search capability for: "${query.keyword}"`);
    this.scrapedProfiles = await tinyfishAgent.runAgentSearch(query.keyword, query.city);
  }

  async collect(page, maxLeads) {
    const list = this.scrapedProfiles.slice(0, maxLeads);
    this.scrapedProfiles = list;
    return this.scrapedProfiles.length;
  }

  async extract(page, cardIndex) {
    const profile = this.scrapedProfiles && this.scrapedProfiles[cardIndex];
    if (!profile) return null;

    return {
      name: profile.name || 'LinkedIn Member',
      website: profile.profileUrl || profile.website || '',
      headline: profile.headline || '',
      description: profile.description || ''
    };
  }

  normalize(raw, city) {
    return {
      name: raw.name,
      website: raw.website || null,
      city: city || '',
      notes: `Headline: ${raw.headline}. Description: ${raw.description}`,
      source: 'linkedin',
      status: 'new'
    };
  }
}

module.exports = LinkedInProvider;
