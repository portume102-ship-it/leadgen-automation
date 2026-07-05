// backend/repositories/followupRepository.js
const db = require('../database/db');
const { handleDbError } = require('../database/dbErrorHandler');

/**
 * @typedef {Object} FollowupTask
 * @property {string} [id] UUID primary key
 * @property {string} business_id Associated business profile ID (UUID)
 * @property {string} scheduled_at ISO Timestamp of execution time
 * @property {'pending'|'completed'|'cancelled'} [status] Execution status
 * @property {string} [reason] Purpose of followup
 * @property {Object} [payload] Action configuration payload
 * @property {string} [created_at] ISO Timestamp
 * @property {string} [updated_at] ISO Timestamp
 */

/**
 * @typedef {Object} MeetingRecord
 * @property {string} [id] UUID primary key
 * @property {string} business_id Associated business profile ID (UUID)
 * @property {string} scheduled_at ISO Timestamp of meeting
 * @property {number} [duration_minutes] Meeting length in minutes
 * @property {'scheduled'|'completed'|'no_show'|'cancelled'} [status] Meeting status
 * @property {string} [notes] Meeting notes / transcripts summary
 * @property {string} [recording_url] Video/Audio recording URL
 */

class FollowupRepository {
  // =========================================================================
  // Followup Queue CRUD & Search
  // =========================================================================

  /**
   * Add a new followup task to the queue
   * @param {FollowupTask} data Task data
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask>}
   */
  async create(data, tx = null) {
    const text = `
      INSERT INTO followup_queue (business_id, scheduled_at, status, reason, payload)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [
      data.business_id,
      data.scheduled_at,
      data.status || 'pending',
      data.reason || null,
      data.payload ? JSON.stringify(data.payload) : '{}'
    ];

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'create');
      return res.rows[0];
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.create');
    }
  }

  /**
   * Update a followup task's properties (status, execution, payload, reschedule)
   * @param {string} id Task ID (UUID)
   * @param {Partial<FollowupTask>} data Updates
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask|null>}
   */
  async update(id, data, tx = null) {
    const fields = [];
    const params = [id];
    let paramIndex = 2;

    const updatableFields = ['scheduled_at', 'status', 'reason', 'payload'];
    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(key === 'payload' ? JSON.stringify(data[key]) : data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id, tx);
    }

    const text = `
      UPDATE followup_queue
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'update');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.update');
    }
  }

  /**
   * Get a followup task by its ID
   * @param {string} id Task ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask|null>}
   */
  async findById(id, tx = null) {
    const text = `SELECT * FROM followup_queue WHERE id = $1;`;
    try {
      const res = await db.execute(tx, text, [id], 'FollowupRepository', 'findById');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.findById');
    }
  }

  /**
   * Get followup tasks linked to a specific lead ID
   * @param {string} leadId Lead ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask[]>}
   */
  async findByLeadId(leadId, tx = null) {
    const text = `
      SELECT fq.* FROM followup_queue fq
      JOIN business_profiles bp ON fq.business_id = bp.id
      WHERE bp.lead_id = $1
      ORDER BY fq.scheduled_at ASC;
    `;
    try {
      const res = await db.execute(tx, text, [leadId], 'FollowupRepository', 'findByLeadId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.findByLeadId');
    }
  }

  /**
   * Delete a followup task
   * @param {string} id Task ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<boolean>}
   */
  async delete(id, tx = null) {
    const text = `DELETE FROM followup_queue WHERE id = $1 RETURNING id;`;
    try {
      const res = await db.execute(tx, text, [id], 'FollowupRepository', 'delete');
      return res.rowCount > 0;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.delete');
    }
  }

  /**
   * List scheduled followup tasks from queue with status or timeline filters
   * @param {Object} [options] List filters
   * @param {number} [options.limit] Max records (default 50)
   * @param {number} [options.offset] Pagination offset (default 0)
   * @param {'pending'|'completed'|'cancelled'} [options.status] Filter by task status
   * @param {string} [options.before] ISO timestamp range upper bound
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask[]>}
   */
  async list(options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const params = [limit, offset];
    let paramIndex = 3;

    let text = `SELECT * FROM followup_queue`;
    const clauses = [];

    if (options.status) {
      clauses.push(`status = $${paramIndex}`);
      params.push(options.status);
      paramIndex++;
    }

    if (options.before) {
      clauses.push(`scheduled_at <= $${paramIndex}`);
      params.push(options.before);
      paramIndex++;
    }

    if (clauses.length > 0) {
      text += ` WHERE ${clauses.join(' AND ')}`;
    }

    text += ` ORDER BY scheduled_at ASC LIMIT $1 OFFSET $2;`;

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'list');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.list');
    }
  }

  /**
   * Search followup queue tasks matching text keyword
   * @param {string} queryText Search term
   * @param {Object} [options] Pagination parameters
   * @param {number} [options.limit] Max records
   * @param {number} [options.offset] Pagination offset
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<FollowupTask[]>}
   */
  async search(queryText, options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const pattern = `%${queryText}%`;
    const params = [pattern, limit, offset];

    const text = `
      SELECT * FROM followup_queue
      WHERE reason ILIKE $1 
         OR status ILIKE $1
      ORDER BY scheduled_at ASC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'search');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.search');
    }
  }

  // =========================================================================
  // Meeting History Operations
  // =========================================================================

  /**
   * Record a scheduled or completed meeting in history
   * @param {MeetingRecord} data Meeting properties
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<MeetingRecord>}
   */
  async createMeeting(data, tx = null) {
    const text = `
      INSERT INTO meeting_history (business_id, scheduled_at, duration_minutes, status, notes, recording_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const params = [
      data.business_id,
      data.scheduled_at,
      data.duration_minutes || null,
      data.status || 'scheduled',
      data.notes || null,
      data.recording_url || null
    ];

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'createMeeting');
      return res.rows[0];
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.createMeeting');
    }
  }

  /**
   * Update a meeting record
   * @param {string} id Meeting ID (UUID)
   * @param {Partial<MeetingRecord>} data Updates
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<MeetingRecord|null>}
   */
  async updateMeeting(id, data, tx = null) {
    const fields = [];
    const params = [id];
    let paramIndex = 2;

    const updatableFields = ['scheduled_at', 'duration_minutes', 'status', 'notes', 'recording_url'];
    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      const text = `SELECT * FROM meeting_history WHERE id = $1;`;
      const res = await db.execute(tx, text, [id], 'FollowupRepository', 'getMeetingById');
      return res.rows[0] || null;
    }

    const text = `
      UPDATE meeting_history
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const res = await db.execute(tx, text, params, 'FollowupRepository', 'updateMeeting');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.updateMeeting');
    }
  }

  /**
   * Fetch meetings linked to a business profile
   * @param {string} businessId Business ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<MeetingRecord[]>}
   */
  async getMeetingsByBusinessId(businessId, tx = null) {
    const text = `SELECT * FROM meeting_history WHERE business_id = $1 ORDER BY scheduled_at DESC;`;
    try {
      const res = await db.execute(tx, text, [businessId], 'FollowupRepository', 'getMeetingsByBusinessId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.getMeetingsByBusinessId');
    }
  }

  /**
   * Fetch meetings linked to a specific lead ID
   * @param {string} leadId Lead ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<MeetingRecord[]>}
   */
  async getMeetingsByLeadId(leadId, tx = null) {
    const text = `
      SELECT mh.* FROM meeting_history mh
      JOIN business_profiles bp ON mh.business_id = bp.id
      WHERE bp.lead_id = $1
      ORDER BY mh.scheduled_at DESC;
    `;
    try {
      const res = await db.execute(tx, text, [leadId], 'FollowupRepository', 'getMeetingsByLeadId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'FollowupRepository.getMeetingsByLeadId');
    }
  }
}

module.exports = new FollowupRepository();
