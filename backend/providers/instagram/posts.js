// backend/providers/instagram/posts.js

class InstagramPostsFetcher {
  async fetch(page) {
    // Return empty list as public profiling restricts timeline scraping without API authentication
    return [];
  }
}

module.exports = new InstagramPostsFetcher();
