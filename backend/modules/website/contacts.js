// backend/modules/website/contacts.js

class ContactsAnalyzer {
  async analyze(page) {
    const pageContent = await page.content().catch(() => '');
    
    // Parse emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = Array.from(new Set(pageContent.match(emailRegex) || []));

    // Parse phones
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneNumbers = Array.from(new Set(pageContent.match(phoneRegex) || []));

    // Parse social links
    const socialLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      const hrefs = anchors.map(a => a.href.trim());

      const socialPatterns = {
        instagram: /instagram\.com/i,
        facebook: /facebook\.com/i,
        linkedin: /linkedin\.com/i,
        twitter: /(twitter\.com|x\.com)/i,
        youtube: /youtube\.com/i,
        whatsapp: /(wa\.me|api\.whatsapp\.com)/i
      };

      const links = [];
      hrefs.forEach(h => {
        for (const key in socialPatterns) {
          if (socialPatterns[key].test(h)) {
            links.push(h);
          }
        }
      });
      return Array.from(new Set(links));
    }).catch(() => []);

    return {
      emails,
      phone_numbers: phoneNumbers,
      social_links: socialLinks
    };
  }
}

module.exports = new ContactsAnalyzer();
