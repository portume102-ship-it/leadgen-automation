// backend/repositories/leadsRepository.js

const supabase = require('../database/connection');
const logger = require('../worker/logger');

class LeadsRepository {
  async upsert(leadData) {
    logger.debug(`[LeadsRepository] Upserting lead: ${leadData.name}`);
    
    // In Supabase client library: upsert resolves conflict based on unique columns automatically
    const { data, error } = await supabase
      .from('leads')
      .upsert([leadData], {
        onConflict: leadData.phone ? 'phone' : undefined,
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      logger.error(`[LeadsRepository] upsert error: ${error.message}`);
      throw error;
    }
    return data;
  }

  async getById(id) {
    logger.debug(`[LeadsRepository] Fetching lead by ID: ${id}`);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error(`[LeadsRepository] getById error: ${error.message}`);
      throw error;
    }
    return data;
  }
}

module.exports = new LeadsRepository();
