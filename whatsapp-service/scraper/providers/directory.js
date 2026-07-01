// whatsapp-service/scraper/providers/directory.js

class DirectoryProvider {
  constructor() {
    this.name = 'directory';
  }

  async search(page, query) {
    const searchUrl = `https://www.google.com/search?q=yellow+pages+${encodeURIComponent(query.keyword + ' ' + query.city)}`;
    console.log(`🔍 [Directory Provider] Searching directory indices: ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
  }

  async collect(page, maxLeads) {
    const links = await page.evalOnSelectorAll(
      '#search a[href^="http"]',
      els => els.map(e => e.href)
    );
    return links.slice(0, maxLeads);
  }

  async extract(page, url) {
    return {
      name: 'Directory Listing',
      website: url,
      category: 'Directory Profile',
      phone: null,
      address: null
    };
  }

  normalize(raw, city) {
    return {
      name: raw.name,
      phone: null,
      email: null,
      address: null,
      city: city || null,
      category: 'directory_lead',
      website: raw.website,
      rating: null,
      review_count: null,
      source: 'directory',
      status: 'new'
    };
  }
}

module.exports = DirectoryProvider;
