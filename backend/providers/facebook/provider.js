// backend/providers/facebook/provider.js

const logger = require('../../worker/logger');
const sessionManager = require('../../worker/sessionManager');

class FacebookProvider {
  constructor() {
    this.name = 'facebook';
    this.collectedUrls = [];
  }

  async search(page, query) {
    const searchTerm = query.area 
      ? `${query.keyword} in ${query.area}, ${query.city}`
      : `${query.keyword} in ${query.city}`;
    
    logger.info(`[Facebook Provider] Initiating Facebook page search for: "${searchTerm}"`);
    
    // 1. Try to load authenticated session cookies if scraper user is configured
    const crawlerUser = process.env.FACEBOOK_ACCOUNT_USER;
    if (crawlerUser) {
      const sessionLoaded = await sessionManager.loadSession(page.context(), 'facebook', crawlerUser);
      if (sessionLoaded) {
        logger.info(`[Facebook Provider] Active Facebook session cookies loaded for: ${crawlerUser}`);
      }
    }

    // 2. Perform search via mobile-optimized Facebook search URL
    const searchUrl = `https://mbasic.facebook.com/search/pages/?q=${encodeURIComponent(searchTerm)}`;
    logger.info(`[Facebook Provider] Navigating to search URL: ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });
    
    // basic verification
    const title = await page.title();
    if (title.toLowerCase().includes('checkpoint') || title.toLowerCase().includes('security') || title.toLowerCase().includes('captcha')) {
      logger.error(`[Facebook Provider] Login wall, checkpoint or Captcha detected!`);
      throw new Error('FACEBOOK_CHECKPOINT_WALL');
    }
  }

  async collect(page, maxLeads) {
    logger.info(`[Facebook Provider] Collecting Facebook page results...`);
    
    // Extract basic mobile layout links for business pages
    const hrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(a => a.getAttribute('href'))
        .filter(href => href && (href.startsWith('/pages/') || href.includes('facebook.com/pages/') || href.match(/^\/[a-zA-Z0-9.]+$/) && !href.includes('search') && !href.includes('login') && !href.includes('help')))
        .map(href => {
          if (href.startsWith('/')) return `https://mbasic.facebook.com${href}`;
          return href;
        });
    });

    // Deduplicate
    const unique = [...new Set(hrefs)];
    this.collectedUrls = unique.slice(0, maxLeads);
    logger.info(`[Facebook Provider] Collected ${this.collectedUrls.length} page URLs.`);
    return this.collectedUrls.length;
  }

  async extract(page, cardIndex) {
    const pageUrl = this.collectedUrls[cardIndex];
    if (!pageUrl) return null;

    logger.info(`[Facebook Provider] Navigating to page index ${cardIndex}: ${pageUrl}`);
    await page.goto(pageUrl, { timeout: 20000, waitUntil: 'domcontentloaded' });

    // Click basic mobile "About" tab if exists, or query page info directly
    const aboutUrl = pageUrl.includes('?') ? `${pageUrl}&v=info` : `${pageUrl}/about` ;
    logger.info(`[Facebook Provider] Attempting info extraction from About page: ${aboutUrl}`);
    await page.goto(aboutUrl, { timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => {});

    const details = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('span, div, td, a')).map(el => (el.innerText || '').trim());
      const bodyText = document.body ? document.body.innerText : '';

      // Extractor functions
      const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = bodyText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      
      let website = '';
      const links = Array.from(document.querySelectorAll('a'));
      const websiteLink = links.find(a => {
        const href = a.getAttribute('href') || '';
        return href.includes('l.facebook.com/l.php?u=') || (!href.includes('facebook.com') && !href.startsWith('/') && href.startsWith('http'));
      });

      if (websiteLink) {
        const href = websiteLink.getAttribute('href');
        if (href.includes('l.facebook.com/l.php?u=')) {
          try {
            const urlObj = new URL(href);
            website = decodeURIComponent(urlObj.searchParams.get('u') || href);
          } catch (_) {
            website = href;
          }
        } else {
          website = href;
        }
      }

      // Find business page name
      const titleEl = document.querySelector('title') || document.querySelector('h1, h2');
      const pageName = titleEl ? titleEl.innerText.replace(' - About', '').trim() : 'Facebook Business Page';

      return {
        name: pageName,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        website: website
      };
    });

    return {
      ...details,
      facebookUrl: pageUrl
    };
  }

  normalize(raw, city) {
    return {
      name: raw.name,
      phone: raw.phone || null,
      email: raw.email || null,
      website: raw.website || null,
      city: city || '',
      source: 'facebook',
      status: 'new',
      notes: `Facebook URL: ${raw.facebookUrl}`
    };
  }
}

module.exports = FacebookProvider;
