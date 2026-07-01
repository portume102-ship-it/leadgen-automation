// backend/providers/instagram/profile.js

const logger = require('../../worker/logger');

class InstagramProfileFetcher {
  async fetch(page) {
    return await page.evaluate(() => {
      const descNode = document.querySelector('meta[name="description"]');
      const desc = descNode ? descNode.getAttribute('content') : '';

      let followers = 0;
      let following = 0;
      let posts = 0;

      const matches = desc.match(/([\d,.\sMK]+)\s*Followers,\s*([\d,.\sMK]+)\s*Following,\s*([\d,.\sMK]+)\s*Posts/i);
      if (matches) {
        const cleanNum = (str) => {
          let s = str.trim().toUpperCase().replace(/,/g, '');
          if (s.includes('K')) return parseFloat(s) * 1000;
          if (s.includes('M')) return parseFloat(s) * 1000000;
          return parseInt(s, 10) || 0;
        };
        followers = cleanNum(matches[1]);
        following = cleanNum(matches[2]);
        posts = cleanNum(matches[3]);
      }

      const headerEl = document.querySelector('h2');
      const displayName = headerEl ? headerEl.innerText.trim() : null;
      
      const bioEl = document.querySelector('main header section div span');
      const bio = bioEl ? bioEl.innerText.trim() : null;

      const websiteEl = document.querySelector('main header section a[href]');
      const website = websiteEl ? websiteEl.getAttribute('href') : null;

      const isVerified = !!document.querySelector('svg[aria-label="Verified"]');

      return {
        display_name: displayName,
        bio,
        website,
        followers,
        following,
        posts_count: posts,
        verified: isVerified
      };
    }).catch(() => null);
  }
}

module.exports = new InstagramProfileFetcher();
