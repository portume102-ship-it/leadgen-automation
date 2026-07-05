// backend/repositories/researchRepository.js
const db = require('../database/db');
const { handleDbError } = require('../database/dbErrorHandler');

/**
 * @typedef {Object} BusinessResearch
 * @property {string} [id] UUID primary key
 * @property {string} business_id Associated business profile ID (UUID)
 * @property {string} research_topic Topic of research (e.g. 'competitors', 'marketing_strategy')
 * @property {Object} [findings] Research findings json payload
 * @property {string} [summary] Research text summary
 * @property {string[]} [source_urls] List of crawled source URLs
 * @property {string} [created_at] ISO Timestamp
 * @property {string} [updated_at] ISO Timestamp
 */

class ResearchRepository {
  /**
   * Create a new research record
   * @param {BusinessResearch} data Research details
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch>}
   */
  async create(data, tx = null) {
    const text = `
      INSERT INTO business_research (business_id, research_topic, findings, summary, source_urls)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [
      data.business_id,
      data.research_topic,
      data.findings ? JSON.stringify(data.findings) : '{}',
      data.summary || null,
      data.source_urls || []
    ];

    try {
      const res = await db.execute(tx, text, params, 'ResearchRepository', 'create');
      return res.rows[0];
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.create');
    }
  }

  /**
   * Update an existing research record
   * @param {string} id Research ID (UUID)
   * @param {Partial<BusinessResearch>} data Updates
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch|null>}
   */
  async update(id, data, tx = null) {
    const fields = [];
    const params = [id];
    let paramIndex = 2;

    const updatableFields = ['research_topic', 'findings', 'summary', 'source_urls'];
    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(key === 'findings' ? JSON.stringify(data[key]) : data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id, tx);
    }

    const text = `
      UPDATE business_research
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const res = await db.execute(tx, text, params, 'ResearchRepository', 'update');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.update');
    }
  }

  /**
   * Find a research record by its ID
   * @param {string} id Research ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch|null>}
   */
  async findById(id, tx = null) {
    const text = `SELECT * FROM business_research WHERE id = $1;`;
    try {
      const res = await db.execute(tx, text, [id], 'ResearchRepository', 'findById');
      return res.rows[0] || null;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.findById');
    }
  }

  /**
   * Find research records associated with a specific lead ID
   * @param {string} leadId Lead ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch[]>}
   */
  async findByLeadId(leadId, tx = null) {
    const text = `
      SELECT br.* FROM business_research br
      JOIN business_profiles bp ON br.business_id = bp.id
      WHERE bp.lead_id = $1
      ORDER BY br.created_at DESC;
    `;
    try {
      const res = await db.execute(tx, text, [leadId], 'ResearchRepository', 'findByLeadId');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.findByLeadId');
    }
  }

  /**
   * Delete a research record
   * @param {string} id Research ID (UUID)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<boolean>}
   */
  async delete(id, tx = null) {
    const text = `DELETE FROM business_research WHERE id = $1 RETURNING id;`;
    try {
      const res = await db.execute(tx, text, [id], 'ResearchRepository', 'delete');
      return res.rowCount > 0;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.delete');
    }
  }

  /**
   * List research records with pagination
   * @param {Object} [options] List options
   * @param {number} [options.limit] Max records (default 50)
   * @param {number} [options.offset] Pagination offset (default 0)
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch[]>}
   */
  async list(options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const text = `SELECT * FROM business_research ORDER BY updated_at DESC LIMIT $1 OFFSET $2;`;
    
    try {
      const res = await db.execute(tx, text, [limit, offset], 'ResearchRepository', 'list');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.list');
    }
  }

  /**
   * Search research records by query string matching topic or summary text
   * @param {string} queryText Search term
   * @param {Object} [options] Pagination parameters
   * @param {number} [options.limit] Max records
   * @param {number} [options.offset] Pagination offset
   * @param {import('pg').ClientBase} [tx] Optional transaction client
   * @returns {Promise<BusinessResearch[]>}
   */
  async search(queryText, options = {}, tx = null) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const pattern = `%${queryText}%`;
    const params = [pattern, limit, offset];

    const text = `
      SELECT * FROM business_research
      WHERE research_topic ILIKE $1 
         OR summary ILIKE $1
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const res = await db.execute(tx, text, params, 'ResearchRepository', 'search');
      return res.rows;
    } catch (err) {
      throw handleDbError(err, 'ResearchRepository.search');
    }
  }
}

module.exports = new ResearchRepository();
