// backend/modules/website/accessibility.js

class AccessibilityAnalyzer {
  async analyze(page) {
    const images = await page.evaluate(() => {
      const total = document.querySelectorAll('img').length;
      const missingAlt = document.querySelectorAll('img:not([alt]), img[alt=""]').length;
      return { total, missingAlt };
    }).catch(() => ({ total: 0, missingAlt: 0 }));

    let accessibilityScore = 100;
    if (images.total > 0) {
      const missingPct = images.missingAlt / images.total;
      accessibilityScore -= Math.round(missingPct * 50);
    }

    return {
      total_images: images.total,
      missing_alt_images: images.missingAlt,
      score: Math.max(0, accessibilityScore)
    };
  }
}

module.exports = new AccessibilityAnalyzer();
