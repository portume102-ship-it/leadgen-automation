// backend/providers/instagram/profile.js

const logger = require('../../worker/logger');

class InstagramProfileFetcher {
  async fetch(page) {
    return await page.evaluate(() => {
      const descNode = document.querySelector('meta[name="description"]');
      const desc = descNode ? descNode.getAttribute('content') : '';

      const cleanNum = (str) => {
        let s = str.trim().toUpperCase().replace(/,/g, '');
        if (s.includes('K')) return parseFloat(s) * 1000;
        if (s.includes('M')) return parseFloat(s) * 1000000;
        return parseInt(s, 10) || 0;
      };

      // 1. Primary Pipeline: SEO Meta Description Parsing (Highly robust & DOM-layout independent)
      if (desc) {
        const regex = /([\d,.\sMK]+)\s*Followers,\s*([\d,.\sMK]+)\s*Following,\s*([\d,.\sMK]+)\s*Posts\s*-\s*([^(@]+)\s*\((@?\w+)\)\s*on Instagram(?::\s*"?(.*?)"?)?$/is;
        const matches = desc.match(regex);
        if (matches) {
          // Attempt to extract website link from DOM
          const websiteEl = document.querySelector('main header section a[href]');
          const website = websiteEl ? websiteEl.getAttribute('href') : null;

          // Check verified status
          const isVerified = !!document.querySelector('svg[aria-label="Verified"]');

          return {
            display_name: matches[4].trim(),
            bio: matches[6] ? matches[6].trim() : 'Business profile details page.',
            website: website,
            followers: cleanNum(matches[1]),
            following: cleanNum(matches[2]),
            posts_count: cleanNum(matches[3]),
            verified: isVerified
          };
        }
      }

      // 2. Secondary Fallback: DOM Selectors (Legacy layout compatibility)
      let followers = 0;
      let following = 0;
      let posts = 0;

      const matchesFallback = desc.match(/([\d,.\sMK]+)\s*Followers,\s*([\d,.\sMK]+)\s*Following,\s*([\d,.\sMK]+)\s*Posts/i);
      if (matchesFallback) {
        followers = cleanNum(matchesFallback[1]);
        following = cleanNum(matchesFallback[2]);
        posts = cleanNum(matchesFallback[3]);
      }

      const headerEl = document.querySelector('h2');
      const displayName = headerEl ? headerEl.innerText.trim() : null;
      
      const bioEl = document.querySelector('main header section div span');
      const bio = bioEl ? bioEl.innerText.trim() : null;

      const websiteEl = document.querySelector('main header section a[href]');
      const website = websiteEl ? websiteEl.getAttribute('href') : null;

      const isVerified = !!document.querySelector('svg[aria-label="Verified"]');

      if (!displayName) return null;

      return {
        display_name: displayName,
        bio: bio || 'Business profile details page.',
        website,
        followers,
        following,
        posts_count: posts,
        verified: isVerified
      };
    }).catch((err) => {
      return null;
    });
  }
}

module.exports = new InstagramProfileFetcher();
