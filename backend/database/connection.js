// backend/database/connection.js

const { createClient } = require('@supabase/supabase-js');
const logger = require('../worker/logger');

require('dotenv').config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  logger.error('[Database] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
}

logger.info(`[Database] Initializing Supabase client at ${supabaseUrl}...`);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

module.exports = supabase;
