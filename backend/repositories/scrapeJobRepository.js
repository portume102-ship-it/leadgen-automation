// backend/repositories/scrapeJobRepository.js

const supabase = require('../database/connection');
const logger = require('../worker/logger');

class ScrapeJobRepository {
  async getById(id) {
    logger.debug(`[ScrapeJobRepository] Fetching job: ${id}`);
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error(`[ScrapeJobRepository] getById error: ${error.message}`);
      throw error;
    }
    return data;
  }

  async getAll(options = {}) {
    logger.debug('[ScrapeJobRepository] Fetching all jobs...');
    let query = supabase.from('scrape_jobs').select('*');

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.order) {
      query = query.order('created_at', { ascending: options.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      logger.error(`[ScrapeJobRepository] getAll error: ${error.message}`);
      throw error;
    }
    return data || [];
  }

  async create(jobData) {
    logger.debug('[ScrapeJobRepository] Creating new job...');
    const { data, error } = await supabase
      .from('scrape_jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      logger.error(`[ScrapeJobRepository] create error: ${error.message}`);
      throw error;
    }
    return data;
  }

  async update(id, updates) {
    logger.debug(`[ScrapeJobRepository] Updating job ${id}...`);
    const { data, error } = await supabase
      .from('scrape_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`[ScrapeJobRepository] update error: ${error.message}`);
      throw error;
    }
    return data;
  }

  async getRunningOrQueuedJobs() {
    logger.debug('[ScrapeJobRepository] Querying active/running/queued jobs...');
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .in('status', ['running', 'queued'])
      .order('created_at', { ascending: true });

    if (error) {
      logger.error(`[ScrapeJobRepository] getRunningOrQueuedJobs error: ${error.message}`);
      throw error;
    }
    return data || [];
  }
}

module.exports = new ScrapeJobRepository();
