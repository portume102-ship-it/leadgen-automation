// backend/controllers/outreachController.js
const outreachService = require('../services/outreachService');
const intelligenceService = require('../services/intelligenceService');
const conversationRepo = require('../repositories/conversationRepository');
const logger = require('../worker/logger');

// Regex to validate UUID format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(uuid) {
  return UUID_REGEX.test(uuid);
}

function sendResponse(res, req, statusCode, data = {}) {
  res.status(statusCode).json({
    success: true,
    timestamp: new Date().toISOString(),
    executionTimeMs: Date.now() - req.startTime,
    ...data
  });
}

class OutreachController {
  /**
   * Start outreach tracking for a lead
   */
  async initialize(req, res, next) {
    const start = Date.now();
    req.startTime = start;
    const { leadId } = req.body;

    logger.info({ leadId, controller: 'OutreachController', operation: 'initialize' }, '[Outreach Controller] POST /initialize received.');

    if (!leadId || !isValidUUID(leadId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameter: leadId must be a valid UUID.'
      });
    }

    try {
      const result = await outreachService.initializeOutreach(leadId);
      logger.info({ leadId, executionTimeMs: Date.now() - start, success: true }, '[Outreach Controller] Outreach initialized successfully.');
      sendResponse(res, req, 201, result);
    } catch (err) {
      logger.error({ leadId, error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Initialization failed.');
      next(err);
    }
  }

  /**
   * Fetch conversation state for a lead
   */
  async getConversationState(req, res, next) {
    const start = Date.now();
    req.startTime = start;
    const { leadId } = req.params;

    logger.info({ leadId, controller: 'OutreachController', operation: 'getConversationState' }, '[Outreach Controller] GET /conversation/:leadId received.');

    if (!leadId || !isValidUUID(leadId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameter: leadId path param must be a valid UUID.'
      });
    }

    try {
      const state = await conversationRepo.findByLeadId(leadId);
      if (!state) {
        return res.status(404).json({
          success: false,
          error: `No outreach sequence or conversation state found for lead ID ${leadId}.`
        });
      }
      logger.info({ leadId, executionTimeMs: Date.now() - start, success: true }, '[Outreach Controller] Conversation state retrieved.');
      sendResponse(res, req, 200, { state });
    } catch (err) {
      logger.error({ leadId, error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Failed to retrieve conversation state.');
      next(err);
    }
  }

  /**
   * Process all pending followup tasks currently due
   */
  async processFollowups(req, res, next) {
    const start = Date.now();
    req.startTime = start;

    logger.info({ controller: 'OutreachController', operation: 'processFollowups' }, '[Outreach Controller] POST /followups/process received.');

    try {
      const result = await outreachService.processFollowupQueue();
      logger.info({ executionTimeMs: Date.now() - start, success: true, processedCount: result.processedCount }, '[Outreach Controller] Followup queue processing completed.');
      sendResponse(res, req, 200, result);
    } catch (err) {
      logger.error({ error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Followup processing failed.');
      next(err);
    }
  }

  /**
   * Process simulated incoming message from a lead
   */
  async handleInbound(req, res, next) {
    const start = Date.now();
    req.startTime = start;
    const { leadId, body, channel, sender } = req.body;

    logger.info({ leadId, channel, controller: 'OutreachController', operation: 'handleInbound' }, '[Outreach Controller] POST /message/inbound received.');

    if (!leadId || !isValidUUID(leadId)) {
      return res.status(400).json({ success: false, error: 'leadId must be a valid UUID.' });
    }
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'body content is required.' });
    }
    if (!channel || !['whatsapp', 'email'].includes(channel)) {
      return res.status(400).json({ success: false, error: 'channel must be either "whatsapp" or "email".' });
    }

    try {
      const result = await outreachService.handleInboundMessage(leadId, { body, channel, sender });
      logger.info({ leadId, executionTimeMs: Date.now() - start, success: true }, '[Outreach Controller] Inbound message handled successfully.');
      sendResponse(res, req, 200, result);
    } catch (err) {
      logger.error({ leadId, error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Inbound message handling failed.');
      next(err);
    }
  }

  /**
   * Log a scheduled or completed meeting
   */
  async scheduleMeeting(req, res, next) {
    const start = Date.now();
    req.startTime = start;
    const { leadId, scheduled_at, duration_minutes, notes } = req.body;

    logger.info({ leadId, controller: 'OutreachController', operation: 'scheduleMeeting' }, '[Outreach Controller] POST /meetings received.');

    if (!leadId || !isValidUUID(leadId)) {
      return res.status(400).json({ success: false, error: 'leadId must be a valid UUID.' });
    }
    if (!scheduled_at || isNaN(Date.parse(scheduled_at))) {
      return res.status(400).json({ success: false, error: 'scheduled_at must be a valid date string.' });
    }

    try {
      const meeting = await outreachService.scheduleMeeting(leadId, {
        scheduled_at,
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : 30,
        notes
      });
      logger.info({ leadId, executionTimeMs: Date.now() - start, success: true }, '[Outreach Controller] Meeting logged successfully.');
      sendResponse(res, req, 201, { meeting });
    } catch (err) {
      logger.error({ leadId, error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Meeting scheduling failed.');
      next(err);
    }
  }

  /**
   * Fetch memory insights and observations context for a lead
   */
  async getMemory(req, res, next) {
    const start = Date.now();
    req.startTime = start;
    const { leadId } = req.params;

    logger.info({ leadId, controller: 'OutreachController', operation: 'getMemory' }, '[Outreach Controller] GET /memory/:leadId received.');

    if (!leadId || !isValidUUID(leadId)) {
      return res.status(400).json({ success: false, error: 'leadId must be a valid UUID.' });
    }

    try {
      const context = await intelligenceService.getLeadContext(leadId);
      if (!context.profile) {
        return res.status(404).json({ success: false, error: `No business profile or memory found for lead ID ${leadId}.` });
      }
      logger.info({ leadId, executionTimeMs: Date.now() - start, success: true }, '[Outreach Controller] Memory context retrieved.');
      sendResponse(res, req, 200, context);
    } catch (err) {
      logger.error({ leadId, error: err.message, executionTimeMs: Date.now() - start, success: false }, '[Outreach Controller Error] Memory retrieval failed.');
      next(err);
    }
  }
}

module.exports = new OutreachController();
