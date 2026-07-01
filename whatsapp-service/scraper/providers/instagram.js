// whatsapp-service/scraper/providers/instagram.js

class InstagramProvider {
  constructor() {
    this.name = 'instagram';
  }

  async search(page, query) {
    const searchUrl = `https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(query.keyword + ' ' + query.city)}`;
    console.log(`🔍 [Instagram Provider] Querying site indices: ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
  }

  async collect(page, maxLeads) {
    const links = await page.evalOnSelectorAll(
      '#search a[href*="instagram.com"]',
      els => els.map(e => e.href)
    );
    return links.slice(0, maxLeads);
  }

  async extract(page, profileUrl) {
    await page.goto(profileUrl, { timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => {});
    const title = await page.title().catch(() => 'Instagram Profile');
    
    // Parse username
    const username = profileUrl.split('instagram.com/')[1]?.split('/')[0] || 'instagram_user';
    
    return {
      name: title.split('•')[0].trim() || username,
      website: profileUrl,
      category: 'Instagram Profile',
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
      category: 'social_profile',
      website: raw.website,
      rating: null,
      review_count: null,
      source: 'instagram',
      status: 'new'
    };
  }
}

module.exports = InstagramProvider;
