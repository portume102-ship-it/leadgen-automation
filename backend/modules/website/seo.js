// backend/modules/website/seo.js

class SEOAnalyzer {
  async analyze(page) {
    const pageTitle = await page.title().catch(() => '');
    const currentUrl = page.url();
    const isSsl = currentUrl.startsWith('https:');

    const meta = await page.evaluate(() => {
      const descNode = document.querySelector('meta[name="description"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.innerText.trim());

      return {
        description: descNode ? descNode.getAttribute('content') : null,
        og_title: ogTitle ? ogTitle.getAttribute('content') : null,
        og_description: ogDesc ? ogDesc.getAttribute('content') : null,
        h1_count: h1s.length,
        h1_headings: h1s
      };
    }).catch(() => ({ h1_count: 0, h1_headings: [] }));

    let seoScore = 100;
    if (!pageTitle) seoScore -= 20;
    if (!meta.description) seoScore -= 20;
    if (meta.h1_count === 0) seoScore -= 20;
    if (meta.h1_count > 1) seoScore -= 10;
    if (!isSsl) seoScore -= 10;

    return {
      title: pageTitle,
      description: meta.description,
      og_title: meta.og_title,
      og_description: meta.og_description,
      h1_count: meta.h1_count,
      h1_headings: meta.h1_headings,
      ssl_enabled: isSsl,
      score: Math.max(0, seoScore)
    };
  }
}

module.exports = new SEOAnalyzer();
