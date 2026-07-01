// backend/modules/website/uiux.js

class UIUXAnalyzer {
  async analyze(page) {
    const layout = await page.evaluate(() => {
      const ctaCount = document.querySelectorAll('button, a[href*="contact"], a[href*="book"], a[href*="quote"]').length;
      const heroExists = !!document.querySelector('.hero, #hero, section[class*="hero"]');
      const navExists = !!document.querySelector('nav, header');

      return {
        cta_count: ctaCount,
        hero_exists: heroExists,
        navigation_exists: navExists
      };
    }).catch(() => ({ cta_count: 0, hero_exists: false, navigation_exists: false }));

    let uxScore = 60;
    if (layout.hero_exists) uxScore += 20;
    if (layout.navigation_exists) uxScore += 10;
    if (layout.cta_count > 0) uxScore += 10;

    return {
      cta_count: layout.cta_count,
      hero_exists: layout.hero_exists,
      navigation_exists: layout.navigation_exists,
      score: Math.min(100, uxScore)
    };
  }
}

module.exports = new UIUXAnalyzer();
