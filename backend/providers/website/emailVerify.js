// backend/providers/website/emailVerify.js

const axios = require('axios');
const logger = require('../../worker/logger');

/**
 * Verifies an email address using Hunter or ZeroBounce APIs depending on environment keys.
 * Falls back to basic regex verification if no API keys are present.
 * 
 * @param {string} email - Email address to verify
 * @returns {Promise<{ valid: boolean, reason: string, confidence: number }>}
 */
async function verifyEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'invalid_format', confidence: 0 };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, reason: 'regex_failed', confidence: 0 };
  }

  // 1. ZeroBounce Integration
  if (process.env.ZEROBOUNCE_API_KEY) {
    try {
      logger.info(`[EmailVerify] Validating ${cleanEmail} via ZeroBounce...`);
      const response = await axios.get('https://api.zerobounce.net/v2/validate', {
        params: {
          api_key: process.env.ZEROBOUNCE_API_KEY,
          email: cleanEmail
        },
        timeout: 5000
      });

      const data = response.data;
      const valid = data.status === 'valid';
      let confidence = 0.5;
      if (data.confidence === 'high') confidence = 0.9;
      else if (data.confidence === 'medium') confidence = 0.7;
      else if (data.confidence === 'low') confidence = 0.3;

      return {
        valid,
        reason: data.status || 'unknown',
        confidence
      };
    } catch (err) {
      logger.error(`[EmailVerify] ZeroBounce API error: ${err.message}`);
    }
  }

  // 2. Hunter.io Integration
  if (process.env.HUNTER_API_KEY) {
    try {
      logger.info(`[EmailVerify] Validating ${cleanEmail} via Hunter...`);
      const response = await axios.get('https://api.hunter.io/v2/email-verifier', {
        params: {
          api_key: process.env.HUNTER_API_KEY,
          email: cleanEmail
        },
        timeout: 5000
      });

      const data = response.data && response.data.data;
      if (data) {
        const valid = data.result === 'deliverable';
        const confidence = (data.score || 50) / 100;
        return {
          valid,
          reason: data.result || 'unknown',
          confidence
        };
      }
    } catch (err) {
      logger.error(`[EmailVerify] Hunter.io API error: ${err.message}`);
    }
  }

  // 3. Graceful Fallback (Regex matches, mock valid for local development/testing)
  logger.info(`[EmailVerify] No API keys defined for ZeroBounce/Hunter. Falling back to syntax check for: ${cleanEmail}`);
  return {
    valid: true,
    reason: 'syntax_only_fallback',
    confidence: 0.5
  };
}

module.exports = {
  verifyEmail
};
