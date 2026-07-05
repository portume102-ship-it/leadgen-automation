// backend/providers/reddit/provider.js

const axios = require('axios');
const logger = require('../../worker/logger');

class RedditProvider {
  constructor() {
    this.name = 'reddit';
    this.scrapedPosts = [];
  }

  async search(page, query) {
    // Reddit public JSON endpoints work without login for public listing data
    const subreddit = query.area || 'business'; 
    const searchTerm = query.keyword;
    logger.info(`[Reddit Provider] Querying Reddit API for sub: r/${subreddit}, term: "${searchTerm}"`);
    
    try {
      const url = `https://old.reddit.com/r/${subreddit}/search.json`;
      const response = await axios.get(url, {
        params: {
          q: searchTerm,
          restrict_sr: 'on',
          sort: 'new',
          limit: 100
        },
        headers: {
          // A custom User-Agent is required by Reddit API to avoid 429 Rate Limits
          'User-Agent': 'LeadGenBot/3.0.0 (by /u/leadgen_automation)'
        },
        timeout: 8000
      });

      const children = response.data && response.data.data && response.data.data.children;
      this.scrapedPosts = Array.isArray(children) ? children : [];
      logger.info(`[Reddit Provider] Captured ${this.scrapedPosts.length} posts/comments.`);
    } catch (err) {
      logger.error(`[Reddit Provider] Reddit public API failed: ${err.message}`);
      this.scrapedPosts = [];
    }
  }

  async collect(page, maxLeads) {
    const list = this.scrapedPosts.slice(0, maxLeads);
    this.scrapedPosts = list;
    return this.scrapedPosts.length;
  }

  async extract(page, cardIndex) {
    const child = this.scrapedPosts && this.scrapedPosts[cardIndex];
    if (!child || !child.data) return null;

    const data = child.data;
    return {
      name: `reddit_${data.author}`,
      author: data.author,
      title: data.title || '',
      text: data.selftext || '',
      subreddit: data.subreddit,
      permalink: `https://reddit.com${data.permalink}`,
      created_utc: data.created_utc
    };
  }

  normalize(raw, city) {
    return {
      name: raw.name,
      website: raw.permalink || null,
      city: city || '',
      notes: `Subreddit: r/${raw.subreddit}. Title: ${raw.title}. Content: ${raw.text.slice(0, 300)}`,
      source: 'reddit',
      status: 'new'
    };
  }
}

module.exports = RedditProvider;
