// backend/providers/website/analyzer.js

const logger = require('../../worker/logger');
const seoAnalyzer = require('../../modules/website/seo');
const uiuxAnalyzer = require('../../modules/website/uiux');
const performanceAnalyzer = require('../../modules/website/performance');
const accessibilityAnalyzer = require('../../modules/website/accessibility');
const technologyAnalyzer = require('../../modules/website/technology');
const contactsAnalyzer = require('../../modules/website/contacts');

class WebsiteAnalyzer {
  constructor() {
    this.name = 'website';
  }

  async audit(page, url) {
    logger.info(`[Website Analyzer] Modular Audit Initiated on: ${url}`);
    const startTime = Date.now();

    try {
      logger.info(`[Website Analyzer] Navigating to target site: ${url}`);
      await page.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
      const loadTimeMs = Date.now() - startTime;
      logger.info(`[Website Analyzer] Target loaded. Page load time: ${loadTimeMs}ms`);

      // Invoke individual modules
      logger.info(`[Website Analyzer] Running SEO structural audit...`);
      const seo = await seoAnalyzer.analyze(page);
      
      logger.info(`[Website Analyzer] Running UI/UX heuristic audit...`);
      const uiux = await uiuxAnalyzer.analyze(page);
      
      logger.info(`[Website Analyzer] Running client-side performance benchmarks...`);
      const perf = await performanceAnalyzer.analyze(page, loadTimeMs);
      
      logger.info(`[Website Analyzer] Running accessibility compliance scans...`);
      const access = await accessibilityAnalyzer.analyze(page);
      
      logger.info(`[Website Analyzer] Analyzing client-side framework & package stack...`);
      const tech = await technologyAnalyzer.analyze(page);
      
      logger.info(`[Website Analyzer] Scraping email addresses, phone contacts, and social media handles...`);
      const contacts = await contactsAnalyzer.analyze(page);

      logger.info(`[Website Analyzer] Aggregating overall score...`);
      const overallScore = Math.round((seo.score + uiux.score + access.score + perf.score) / 4);

      logger.info(`[Website Analyzer] Completed audit successfully for: ${url}`);
      return {
        url,
        seo_score: seo.score,
        ux_score: uiux.score,
        performance_score: perf.score,
        accessibility_score: access.score,
        overall_score: overallScore,
        tech_stack: {
          load_time_ms: loadTimeMs,
          ssl_enabled: seo.ssl_enabled,
          technologies: tech.technologies,
          images_count: access.total_images,
          missing_alt_count: access.missing_alt_images
        },
        social_links: contacts.social_links,
        emails: contacts.emails,
        phone_numbers: contacts.phone_numbers,
        screenshot_url: null
      };

    } catch (err) {
      logger.error(`[Website Analyzer] Modular Audit failed on ${url}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new WebsiteAnalyzer();
