// backend/scripts/testEmailScraper.js
//
// Standalone test for the EmailScraper service.
// Run from the /backend directory:
//
//   node scripts/testEmailScraper.js            <- headless
//   node scripts/testEmailScraper.js --headed   <- visible browser (to debug)
//
// Add website URLs from your scraped leads in the TEST_URLS array.

const { chromium } = require('playwright');
const emailScraper = require('../services/emailScraper');

// ─── PUT REAL WEBSITES FROM YOUR LEADS HERE ───────────────────────────────────
const TEST_URLS = [
  // These are real well-known Indian restaurant/cafe websites with contact pages
  'https://www.theleela.com/contact-us',
  'https://www.tajhotels.com',
  'https://www.oberoi-hotels.com',
  // Add scraped website URLs from your leads page here ↓
  // e.g. 'https://corridorsevencoffee.com', 'https://garamshala.in', etc.
];
// ─────────────────────────────────────────────────────────────────────────────

const TIMEOUT_PER_SITE = 25000;
const HEADED = process.argv.includes('--headed');

async function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📧  EmailScraper Standalone Test');
  console.log(`  Mode: ${HEADED ? '👁  HEADED (browser visible)' : '🤖 Headless'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: !HEADED,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
  });

  const results = [];

  for (const url of TEST_URLS) {
    const page = await context.newPage();
    const startMs = Date.now();
    console.log(`🔍 Testing: ${url}`);

    let email = null;
    let error = null;
    try {
      email = await Promise.race([
        emailScraper.scrapeEmail(page, url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timed out after ${TIMEOUT_PER_SITE / 1000}s`)), TIMEOUT_PER_SITE)
        ),
      ]);
    } catch (err) {
      error = err.message;
    }

    const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);

    if (email) {
      console.log(`   ✅  Email found: \x1b[32m${email}\x1b[0m  (${elapsed}s)`);
    } else if (error) {
      console.log(`   ⚠️  ${error}  (${elapsed}s)`);
    } else {
      console.log(`   ❌  No email found  (${elapsed}s)`);
    }

    // Show what URL we ended up on (useful for debugging redirects)
    try {
      const finalUrl = page.url();
      if (finalUrl && finalUrl !== url && finalUrl !== 'about:blank') {
        console.log(`   ↳  Final URL: ${finalUrl}`);
      }
    } catch (_) {}

    results.push({ url, email, elapsed, error });
    await page.close();
  }

  await browser.close();

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📊  Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const found = results.filter(r => r.email).length;
  results.forEach(({ url, email, elapsed, error }) => {
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    const status = email
      ? `\x1b[32m✅ ${email}\x1b[0m`
      : error
        ? `\x1b[33m⚠️  ${error}\x1b[0m`
        : `\x1b[31m❌ Not found\x1b[0m`;
    console.log(`  ${domain.padEnd(35)} ${status}  (${elapsed}s)`);
  });

  console.log(`\n  📬 Result: ${found}/${results.length} emails found`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
