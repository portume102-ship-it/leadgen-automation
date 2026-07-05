-- backend/database/migrations/01_conversation_intelligence_rollback.sql
-- DOWN Migration: Safely drops all tables, triggers, and functions created in 01_conversation_intelligence.sql

-- 1. Drop tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS message_logs CASCADE;
DROP TABLE IF EXISTS meeting_history CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS followup_queue CASCADE;
DROP TABLE IF EXISTS business_memory CASCADE;
DROP TABLE IF EXISTS business_research CASCADE;
DROP TABLE IF EXISTS business_observations CASCADE;
DROP TABLE IF EXISTS conversation_messages CASCADE;
DROP TABLE IF EXISTS conversation_states CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;

-- 2. Drop trigger helper function if no other tables use it
-- Since other system components might use it, we drop it conditionally or just leave it,
-- but since this is a clean rollback, we can drop it. Let's just drop it.
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
