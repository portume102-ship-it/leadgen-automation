// backend/database/migrate.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../worker/logger');
require('dotenv').config();

const config = require('../modules/config');

const connectionString = config.databaseUrl;

if (!connectionString) {
  logger.error('[Migration Runner] Connection string is not set in environment or config fallbacks.');
  process.exit(1);
}

const MIGRATION_NAME = '01_conversation_intelligence';

const UP_FILE = path.join(__dirname, 'migrations', '01_conversation_intelligence.sql');
const DOWN_FILE = path.join(__dirname, 'migrations', '01_conversation_intelligence_rollback.sql');

async function run() {
  const mode = process.argv[2];
  
  if (mode !== '--up' && mode !== '--down') {
    console.log('Usage: node database/migrate.js <--up|--down>');
    process.exit(1);
  }

  logger.info({ mode }, `[Migration Runner] Starting migration run in ${mode} mode...`);

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    logger.info('[Migration Runner] Connected to database.');

    // 1. Ensure migrations_log table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Check if migration has already been executed
    const { rows } = await client.query('SELECT * FROM migrations_log WHERE name = $1', [MIGRATION_NAME]);
    const alreadyRun = rows.length > 0;

    if (mode === '--up') {
      if (alreadyRun) {
        logger.warn({ migration: MIGRATION_NAME }, `[Migration Runner] Migration "${MIGRATION_NAME}" is already applied. Skipping.`);
        console.log(`✓ Migration "${MIGRATION_NAME}" is already applied.`);
        return;
      }

      logger.info({ file: UP_FILE }, `[Migration Runner] Reading UP migration script...`);
      const sql = fs.readFileSync(UP_FILE, 'utf8');

      logger.info('[Migration Runner] Starting UP transaction...');
      await client.query('BEGIN');
      
      await client.query(sql);
      await client.query('INSERT INTO migrations_log (name) VALUES ($1)', [MIGRATION_NAME]);
      
      await client.query('COMMIT');
      logger.info({ migration: MIGRATION_NAME }, `[Migration Runner] Migration "${MIGRATION_NAME}" applied successfully!`);
      console.log(`✓ Migration "${MIGRATION_NAME}" applied successfully.`);
    } else if (mode === '--down') {
      if (!alreadyRun) {
        logger.warn({ migration: MIGRATION_NAME }, `[Migration Runner] Migration "${MIGRATION_NAME}" is not applied. Nothing to rollback.`);
        console.log(`✓ Migration "${MIGRATION_NAME}" is not applied.`);
        return;
      }

      logger.info({ file: DOWN_FILE }, `[Migration Runner] Reading DOWN migration script...`);
      const sql = fs.readFileSync(DOWN_FILE, 'utf8');

      logger.info('[Migration Runner] Starting ROLLBACK transaction...');
      await client.query('BEGIN');
      
      await client.query(sql);
      await client.query('DELETE FROM migrations_log WHERE name = $1', [MIGRATION_NAME]);
      
      await client.query('COMMIT');
      logger.info({ migration: MIGRATION_NAME }, `[Migration Runner] Migration "${MIGRATION_NAME}" rolled back successfully!`);
      console.log(`✓ Migration "${MIGRATION_NAME}" rolled back successfully.`);
    }
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, `[Migration Runner Fatal Error] Migration transaction failed: ${err.message}`);
    try {
      await client.query('ROLLBACK');
      logger.info('[Migration Runner] Rolled back current transaction block.');
    } catch (e) {
      // Ignore rollback errors if transaction was not active
    }
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    logger.info('[Migration Runner] Disconnected from database.');
  }
}

run();
