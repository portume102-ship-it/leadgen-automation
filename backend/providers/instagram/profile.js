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

      // 1. Extract from DOM anchors first (yields 100% exact stats: e.g. "138,278" instead of rounded "138K")
      let domFollowers = null;
      let domFollowing = null;
      let domPosts = null;

      const anchors = Array.from(document.querySelectorAll('a'));
      anchors.forEach(a => {
        const text = a.innerText || '';
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('follower')) {
          const match = text.match(/([\d,.\sMK]+)/i);
          if (match) domFollowers = cleanNum(match[1]);
        } else if (lowerText.includes('following')) {
          const match = text.match(/([\d,.\sMK]+)/i);
          if (match) domFollowing = cleanNum(match[1]);
        } else if (lowerText.includes('post')) {
          const match = text.match(/([\d,.\sMK]+)/i);
          if (match) domPosts = cleanNum(match[1]);
        }
      });

      // Extract all external bio links from the header container (including l.instagram.com redirects)
      const bioLinks = [];
      const headerSection = document.querySelector('main header section');
      if (headerSection) {
        const extAnchors = Array.from(headerSection.querySelectorAll('a[href]'));
        const cleanUrls = new Set();
        
        extAnchors.forEach(a => {
          const href = a.getAttribute('href') || '';
          const text = a.innerText.trim();
          
          let isExternal = false;
          let targetUrl = href;

          if (href.includes('l.instagram.com/?u=')) {
            isExternal = true;
            try {
              const urlObj = new URL(href);
              targetUrl = urlObj.searchParams.get('u') || href;
            } catch (e) {}
          } else if (href && !href.startsWith('/') && !href.includes('instagram.com') && href !== '#') {
            isExternal = true;
          }

          if (isExternal && targetUrl && !cleanUrls.has(targetUrl)) {
            cleanUrls.add(targetUrl);
            bioLinks.push({
              text: text || targetUrl,
              href: targetUrl
            });
          }
        });
      }

      // Check verified status
      const isVerified = !!document.querySelector('svg[aria-label="Verified"]');

      // Extract complete bio text (including category label like "Media/news company")
      const textParts = [];
      const bioSpans = Array.from(document.querySelectorAll('main header section h1 ~ div span, main header section h2 ~ div span, main header section h1 ~ span, main header section h2 ~ span, main header section h1 ~ div div, main header section h2 ~ div div'));
      
      bioSpans.forEach(el => {
        const text = el.innerText ? el.innerText.trim() : '';
        if (text && text.length > 0 && text.length < 500) {
          // Skip statistical elements, links or buttons
          if (!text.includes('followers') && !text.includes('following') && !text.includes('posts') && !text.includes('Follow') && !text.includes('Message')) {
            if (!textParts.includes(text)) {
              textParts.push(text);
            }
          }
        }
      });
      const combinedBio = textParts.length > 0 ? textParts.join('\n') : null;

      // 2. Primary Pipeline: SEO Meta Description Parsing
      if (desc) {
        const regex = /([\d,.\sMK]+)\s*Followers,\s*([\d,.\sMK]+)\s*Following,\s*([\d,.\sMK]+)\s*Posts\s*-\s*([^(@]+)\s*\((@?\w+)\)\s*on Instagram(?::\s*"?(.*?)"?)?$/is;
        const matches = desc.match(regex);
        if (matches) {
          return {
            display_name: matches[4].trim(),
            bio: combinedBio || matches[6]?.trim() || 'Business profile details page.',
            website: bioLinks[0] ? bioLinks[0].href : null,
            bio_links: bioLinks,
            followers: domFollowers !== null ? domFollowers : cleanNum(matches[1]),
            following: domFollowing !== null ? domFollowing : cleanNum(matches[2]),
            posts_count: domPosts !== null ? domPosts : cleanNum(matches[3]),
            verified: isVerified
          };
        }
      }

      // 3. Secondary Fallback: DOM Selectors
      let followers = domFollowers || 0;
      let following = domFollowing || 0;
      let posts = domPosts || 0;

      if (followers === 0 || posts === 0) {
        const matchesFallback = desc.match(/([\d,.\sMK]+)\s*Followers,\s*([\d,.\sMK]+)\s*Following,\s*([\d,.\sMK]+)\s*Posts/i);
        if (matchesFallback) {
          if (followers === 0) followers = cleanNum(matchesFallback[1]);
          if (following === 0) following = cleanNum(matchesFallback[2]);
          if (posts === 0) posts = cleanNum(matchesFallback[3]);
        }
      }

      const headerEl = document.querySelector('h2');
      const displayName = headerEl ? headerEl.innerText.trim() : null;

      if (!displayName) return null;

      return {
        display_name: displayName,
        bio: combinedBio || 'Business profile details page.',
        website: bioLinks[0] ? bioLinks[0].href : null,
        bio_links: bioLinks,
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
