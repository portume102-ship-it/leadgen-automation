// backend/services/aiService.js
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../worker/logger');

// Simple in-memory cache to prevent redundant Gemini call costs
const responseCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Cache helper that limits size
 * @param {string} key Cache key (sha256 hash)
 * @param {string} value Value to cache
 */
function cacheSet(key, value) {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey); // evict oldest entry
  }
  responseCache.set(key, value);
}

/**
 * Execute an async operation with exponential backoff retries
 * @template T
 * @param {function(): Promise<T>} fn Async function to run
 * @param {number} [retries=3] Retries limit
 * @param {number} [delay=1000] Initial delay in ms
 * @returns {Promise<T>}
 */
async function callWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }
      const sleepTime = delay * Math.pow(2, i);
      logger.warn({
        attempt: i + 1,
        maxRetries: retries,
        nextRetryDelayMs: sleepTime,
        error: err.message
      }, `[AI Service] Temporary error calling Gemini API. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, sleepTime));
    }
  }
}

/**
 * Call the Gemini REST API with the provided prompt
 * @param {string} prompt Prompt content
 * @param {boolean} [jsonMode=false] Expect JSON format output
 * @returns {Promise<string>} Model response text
 */
async function callGemini(prompt, jsonMode = false) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    logger.warn('[AI Service] GEMINI_API_KEY is not set. Falling back to mock responses.');
    return jsonMode ? '{"error": "Mock fallback: Gemini key not configured"}' : 'Mock response: Hello from AI service!';
  }

  // Create hash of prompt to look up in cache
  const hash = crypto.createHash('sha256').update(`${prompt}_json=${jsonMode}`).digest('hex');
  if (responseCache.has(hash)) {
    logger.info({ cacheHit: true }, '[AI Service] Cache hit for Gemini query.');
    return responseCache.get(hash);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {}
  };

  if (jsonMode) {
    requestBody.generationConfig.responseMimeType = 'application/json';
  }

  const start = Date.now();

  try {
    const responseText = await callWithRetry(async () => {
      const response = await axios.post(endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000 // 8-second timeout limit
      });

      const candidate = response.data?.candidates?.[0];
      const textResult = candidate?.content?.parts?.[0]?.text;

      if (!textResult) {
        throw new Error('Invalid/empty response structure returned from Gemini API.');
      }

      return textResult.trim();
    });

    const latency = Date.now() - start;
    logger.info({
      externalApi: 'Gemini',
      latencyMs: latency,
      success: true,
      cacheHit: false
    }, `[AI Service] Gemini call completed successfully in ${latency}ms`);

    cacheSet(hash, responseText);
    return responseText;
  } catch (err) {
    const latency = Date.now() - start;
    logger.error({
      externalApi: 'Gemini',
      latencyMs: latency,
      success: false,
      error: err.message,
      stack: err.stack
    }, `[AI Service Error] Gemini call failed after ${latency}ms: ${err.message}`);
    throw err;
  }
}

class AIService {
  /**
   * Draft a personalized outbound message based on structured business profile information and memory
   * @param {string} leadName Name of the lead/business
   * @param {string} industry Primary industry
   * @param {string[]} insights Array of key memory insights
   * @param {string[]} objections Array of objections raised so far
   * @param {Array<{direction: string, body: string}>} [lastMessages=[]] Last messages for conversation flow context
   * @returns {Promise<string>} Drafted outreach message body
   */
  async generateOutboundDraft(leadName, industry, insights, objections, lastMessages = []) {
    // Minimize history context (send max last 3 messages)
    const contextHistory = lastMessages.slice(-3).map(m => `${m.direction === 'inbound' ? 'Lead' : 'Sales'}: ${m.body}`).join('\n');

    const prompt = `
      You are an expert sales outreach assistant. Write a highly personalized, natural-sounding message to a lead.
      Avoid corporate speak, buzzwords, or sounding robotic. Keep it under 3-4 sentences.

      Lead Info:
      * Name: ${leadName}
      * Industry: ${industry || 'Business Services'}
      * Custom Context/Insights: ${insights.join(', ') || 'None'}
      * Objections to address (if any): ${objections.join(', ') || 'None'}

      ${contextHistory ? `Recent conversation context:\n${contextHistory}\n` : ''}
      
      Draft the next message to send (just output the message text directly):
    `;

    return callGemini(prompt, false);
  }

  /**
   * Synthesize raw scraper findings into structured observations, key insights, and objections
   * @param {string} scrapedContent Raw text extracted from profile, SEO data, or audit logs
   * @returns {Promise<{observations: Array<{type: string, content: string}>, insights: string[], objections: string[]}>}
   */
  async extractObservationsAndObjections(scrapedContent) {
    const prompt = `
      Analyze the following raw website scraper data / social audit dump and synthesize key findings.
      Return the output as a clean JSON object containing:
      1. "observations": Array of objects, each with "type" (e.g., 'tech_stack', 'pain_point', 'social_presence') and "content" (the specific finding details). Keep content concise. Limit to 3 items.
      2. "insights": Array of strings representing key insights/opportunities for sales outreach (limit to 2).
      3. "objections": Array of strings representing potential objections or hurdles (e.g. price, security, complexity) that might arise based on their setup.

      Raw Data Dump:
      ${scrapedContent.substring(0, 3000)} -- (truncated for context limit)

      JSON format expected:
      {
        "observations": [{"type": "string", "content": "string"}],
        "insights": ["string"],
        "objections": ["string"]
      }
    `;

    try {
      const responseJsonText = await callGemini(prompt, true);
      return JSON.parse(responseJsonText);
    } catch (err) {
      logger.warn({ error: err.message }, '[AI Service] Failed to parse JSON observations from Gemini. Returning fallback structure.');
      return {
        observations: [{ type: 'audit', content: 'Manual audit required due to processing failure.' }],
        insights: [],
        objections: []
      };
    }
  }

  /**
   * Classify the next conversation stage based on memory and chat logs
   * @param {string} currentStage Current stage
   * @param {Array<{direction: string, body: string}>} messages Recent message logs
   * @returns {Promise<{nextStage: string, nextAction: string}>}
   */
  async classifyStage(currentStage, messages) {
    if (messages.length === 0) {
      return { nextStage: currentStage, nextAction: 'Initiate initial outreach contact.' };
    }

    const contextHistory = messages.slice(-3).map(m => `${m.direction === 'inbound' ? 'Lead' : 'Sales'}: ${m.body}`).join('\n');
    
    const prompt = `
      Classify the next stage and next action of a sales conversation.
      Current Stage: ${currentStage}
      
      Conversation History:
      ${contextHistory}
      
      Select the next logical stage from: ['lead_qualified', 'outreach_started', 'demo_scheduled', 'closed_won', 'closed_lost'].
      Also determine a brief description of the "nextAction".

      Return a JSON object:
      {
        "nextStage": "stage_name",
        "nextAction": "action_description"
      }
    `;

    try {
      const responseJsonText = await callGemini(prompt, true);
      return JSON.parse(responseJsonText);
    } catch (err) {
      return { nextStage: currentStage, nextAction: 'Follow up with lead on previous message.' };
    }
  }
}

module.exports = new AIService();
