// backend/providers/googleMaps/collector.js

const logger = require('../../worker/logger');

const SCROLL_PAUSE = 1500;
const MAX_STALE_SCROLLS = 3;

class GoogleMapsCollector {
  async collect(page, maxLeads) {
    logger.info(`[Google Maps Collector] Scrolling sidebar to load up to ${maxLeads} leads...`);
    const feed = page.locator('div[role="feed"]');
    
    let prevCount = 0;
    let staleCount = 0;

    while (true) {
      const currentCount = await page.locator('div[role="feed"] a.hfpxzc').count();
      logger.info(`   [Scroll] Loaded ${currentCount} listings...`);

      if (currentCount >= maxLeads) {
        break;
      }

      await feed.evaluate(el => el.scrollTop += 900).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, SCROLL_PAUSE));

      const newCount = await page.locator('div[role="feed"] a.hfpxzc').count();
      if (newCount <= prevCount) {
        staleCount++;
        if (staleCount >= MAX_STALE_SCROLLS) {
          break;
        }
      } else {
        staleCount = 0;
      }
      prevCount = newCount;
    }

    // Scroll back to the top of the feed to ensure first elements are clickable
    await feed.evaluate(el => el.scrollTop = 0).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract unique listing URLs (hrefs)
    const hrefs = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('div[role="feed"] a.hfpxzc'));
      return anchors.map(a => a.getAttribute('href')).filter(Boolean);
    });

    const uniqueHrefs = Array.from(new Set(hrefs));
    logger.info(`[Google Maps Collector] Finished scrolling. Collected ${uniqueHrefs.length} unique listing URLs.`);
    return uniqueHrefs;
  }
}

module.exports = new GoogleMapsCollector();
