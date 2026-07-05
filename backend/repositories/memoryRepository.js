// backend/repositories/memoryRepository.js
const db = require('../database/db');
const { handleDbError } = require('../database/dbErrorHandler');

/**
 * @typedef {Object} BusinessMemory
 * @property {string} [id] UUID primary key
 * @property {string} business_id Associated business profile ID (UUID)
 * @property {string[]} [key_insights] Array of qualitative findings
 * @property {Object} [preferences] Client preferences json (e.g. communication speed, channels)
 * @property {string[]} [objections_raised] Array of client concerns
 * @property {string} [summary] Executive memory summary
 * @property {string} [created_at] ISO Timestamp
 * @property {string} [updated_at] ISO Timestamp
 */

/**
 * @typedef {Object} BusinessObservation
 * @property {string} [id] UUID primary key
 * @property {string} business_id Associated business profile ID (UUID)
 * @property {string} observation_type Category of fact (e.g. 'tech_stack', 'pain_point', 'competitor')
 * @property {string} content Qualitative detail
 * @property {number} [confidence_score] Accuracy confidence
 * @property {string} [source] Origin of check (e.g. 'website_scraper', 'whatsapp_reply')
 */

class MemoryRepository {
  // =========================================================================
  // Business Memory CRUD & Search
  // =========================================================================

  /**
   * Create a new business memory instance
   * @param {BusinessMemory} data Memory data
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory>}
   */
  async create(data, tx = null) {
    const text = `
      INSERT INTO business_memory (business_id, key_insights, preferences, objections_raised, summary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [
      data.business_id,
      data.key_insights || [],
      data.preferences ? JSON.stringify(data.preferences) : '{}',
      data.objections_raised || [],
      data.summary || null
    ];

    try {
      const res = await db.execute(tx, text, params, 'MemoryRepository', 'create');
      return res.rows[0];
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.create');
    }
  }

  /**
   * Update an existing business memory instance
   * @param {string} id Memory ID (UUID)
   * @param {Partial<BusinessMemory>} data Updates
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory|null>}
   */
  async update(id, data, tx = null) {
    const fields = [];
    const params = [id];
    let paramIndex = 2;

    const updatableFields = ['key_insights', 'preferences', 'objections_raised', 'summary'];
    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(key === 'preferences' ? JSON.stringify(data[key]) : data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id, tx);
    }

    const text = `
      UPDATE business_memory
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const res = await db.execute(tx, text, params, 'MemoryRepository', 'update');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.update');
    }
  }

  /**
   * Find a business memory record by its ID
   * @param {string} id Memory ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory|null>}
   */
  async findById(id, tx = null) {
    const text = `SELECT * FROM business_memory WHERE id = $1;`;
    try {
      const res = await db.execute(tx, text, [id], 'MemoryRepository', 'findById');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.findById');
    }
  }

  /**
   * Find a business memory record by the associated lead ID
   * @param {string} leadId Lead ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory|null>}
   */
  async findByLeadId(leadId, tx = null) {
    const text = `
      SELECT bm.* FROM business_memory bm
      JOIN business_profiles bp ON bm.business_id = bp.id
      WHERE bp.lead_id = $1;
    `;
    try {
      const res = await db.execute(tx, text, [leadId], 'MemoryRepository', 'findByLeadId');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.findByLeadId');
    }
  }

  /**
   * Delete a business memory record
   * @param {string} id Memory ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<boolean>}
   */
  async delete(id, tx = null) {
    const text = `DELETE FROM business_memory WHERE id = $1 RETURNING id;`;
    try {
      const res = await db.execute(tx, text, [id], 'MemoryRepository', 'delete');
      return res.rowCount > 0;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.delete');
    }
  }

  /**
   * List business memory records with optional limits
   * @param {Object} [options] List options
   * @param {number} [options.limit] Max records (default 50)
   * @param {number} [options.offset] Pagination offset (default 0)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory[]>}
   */
  async list(options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const text = `SELECT * FROM business_memory ORDER BY updated_at DESC LIMIT $1 OFFSET $2;`;
    
    try {
      const res = await db.execute(tx, text, [limit, offset], 'MemoryRepository', 'list');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.list');
    }
  }

  /**
   * Search business memory records containing matching summary text or objections
   * @param {string} queryText Search query term
   * @param {Object} [options] Pagination parameters
   * @param {number} [options.limit] Max records
   * @param {number} [options.offset] Pagination offset
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessMemory[]>}
   */
  async search(queryText, options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const pattern = `%${queryText}%`;
    const params = [pattern, limit, offset];

    const text = `
      SELECT * FROM business_memory
      WHERE summary ILIKE $1 
         OR array_to_string(key_insights, ' ') ILIKE $1
         OR array_to_string(objections_raised, ' ') ILIKE $1
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const res = await db.execute(tx, text, params, 'MemoryRepository', 'search');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.search');
    }
  }

  // =========================================================================
  // Business Observation Operations
  // =========================================================================

  /**
   * Create an observation about a business profile
   * @param {BusinessObservation} data Observation properties
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessObservation>}
   */
  async createObservation(data, tx = null) {
    const text = `
      INSERT INTO business_observations (business_id, observation_type, content, confidence_score, source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [
      data.business_id,
      data.observation_type,
      data.content,
      data.confidence_score !== undefined ? data.confidence_score : 1.0,
      data.source || null
    ];

    try {
      const res = await db.execute(tx, text, params, 'MemoryRepository', 'createObservation');
      return res.rows[0];
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.createObservation');
    }
  }

  /**
   * Find observations for a specific business profile
   * @param {string} businessId Business ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessObservation[]>}
   */
  async getObservationsByBusinessId(businessId, tx = null) {
    const text = `SELECT * FROM business_observations WHERE business_id = $1 ORDER BY created_at DESC;`;
    try {
      const res = await db.execute(tx, text, [businessId], 'MemoryRepository', 'getObservationsByBusinessId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.getObservationsByBusinessId');
    }
  }

  /**
   * Find observations by associated lead ID
   * @param {string} leadId Lead ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessObservation[]>}
   */
  async getObservationsByLeadId(leadId, tx = null) {
    const text = `
      SELECT bo.* FROM business_observations bo
      JOIN business_profiles bp ON bo.business_id = bp.id
      WHERE bp.lead_id = $1
      ORDER BY bo.created_at DESC;
    `;
    try {
      const res = await db.execute(tx, text, [leadId], 'MemoryRepository', 'getObservationsByLeadId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'MemoryRepository.getObservationsByLeadId');
    }
  }
}

module.exports = new MemoryRepository();
