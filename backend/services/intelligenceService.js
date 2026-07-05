// backend/services/intelligenceService.js
const db = require('../database/db');
const { handleDbError } = require('../database/dbErrorHandler');
const businessRepo = require('../repositories/businessRepository');
const memoryRepo = require('../repositories/memoryRepository');
const researchRepo = require('../repositories/researchRepository');
const aiService = require('./aiService');
const logger = require('../worker/logger');

class IntelligenceService {
  /**
   * Synthesize raw scraping data for a lead into observations and memories
   * @param {string} leadId Lead ID (UUID)
   * @param {string} scrapedText Raw scraped text dump
   * @returns {Promise<{success: boolean, observationsCount: number}>}
   */
  async analyzeScrapeResults(leadId, scrapedText) {
    logger.info({ leadId }, '[Intelligence Service] Analyzing scraping findings for lead...');

    // 1. Get business profile
    const profile = await businessRepo.findByLeadId(leadId);
    if (!profile) {
      throw new Error(`Business profile not found for lead ID ${leadId}. Initiate outreach first.`);
    }

    // 2. Call Gemini via aiService to extract observations, insights, and objections
    const extracted = await aiService.extractObservationsAndObjections(scrapedText);
    logger.info({
      leadId,
      observationsFound: extracted.observations.length,
      insightsFound: extracted.insights.length,
      objectionsFound: extracted.objections.length
    }, '[Intelligence Service] AI extraction completed.');

    // 3. Persist observations & memory inside an atomic database transaction
    await db.transaction(async (tx) => {
      // 3.1 Store observations
      for (const obs of extracted.observations) {
        await memoryRepo.createObservation({
          business_id: profile.id,
          observation_type: obs.type,
          content: obs.content,
          confidence_score: 0.9,
          source: 'scraping_audit'
        }, tx);
      }

      // 3.2 Update or create business memory
      const existingMemory = await memoryRepo.findByLeadId(leadId, tx);
      
      if (existingMemory) {
        // Merge insights and objections while filtering duplicates
        const key_insights = Array.from(new Set([...(existingMemory.key_insights || []), ...extracted.insights]));
        const objections_raised = Array.from(new Set([...(existingMemory.objections_raised || []), ...extracted.objections]));
        
        await memoryRepo.update(existingMemory.id, {
          key_insights,
          objections_raised,
          summary: `Aggregated audit summary. Insights: ${key_insights.length} recorded. Objections: ${objections_raised.length} mapped.`
        }, tx);
      } else {
        await memoryRepo.create({
          business_id: profile.id,
          key_insights: extracted.insights,
          objections_raised: extracted.objections,
          summary: `Initial automated audit memory generated from scraper results.`
        }, tx);
      }
    }, 'IntelligenceService.analyzeScrapeResults');

    return {
      success: true,
      observationsCount: extracted.observations.length
    };
  }

  /**
   * Fetch complete consolidated context (profile, memory, research, observations) for a lead
   * @param {string} leadId Lead ID (UUID)
   * @returns {Promise<{profile: Object, memory: Object, research: Object[], observations: Object[]}>}
   */
  async getLeadContext(leadId) {
    const profile = await businessRepo.findByLeadId(leadId);
    if (!profile) {
      return { profile: null, memory: null, research: [], observations: [] };
    }

    const [memory, research, observations] = await Promise.all([
      memoryRepo.findByLeadId(leadId),
      researchRepo.findByLeadId(leadId),
      memoryRepo.getObservationsByLeadId(leadId)
    ]);

    return {
      profile,
      memory,
      research,
      observations
    };
  }
}

module.exports = new IntelligenceService();
