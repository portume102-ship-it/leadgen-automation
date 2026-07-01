// backend/modules/website/technology.js

class TechnologyAnalyzer {
  async analyze(page) {
    return await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const techs = [];
      
      if (html.includes('wp-content')) techs.push('WordPress');
      if (html.includes('__NEXT_DATA__')) techs.push('Next.js');
      if (html.includes('googletagmanager') || html.includes('google-analytics')) techs.push('Google Analytics');
      if (html.includes('cdn.shopify.com')) techs.push('Shopify');
      if (html.includes('elementor')) techs.push('Elementor');

      return {
        technologies: techs
      };
    }).catch(() => ({ technologies: [] }));
  }
}

module.exports = new TechnologyAnalyzer();
