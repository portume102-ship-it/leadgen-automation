-- ============================================================
-- ENRICHMENT COLUMNS MIGRATION
-- Run this in Supabase SQL Editor or migration runner
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_fields jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tools_tried text[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tools_failed text[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_scratchpad text[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'not_started';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT 0;

-- Index to query leads by enrichment status
CREATE INDEX IF NOT EXISTS leads_enrichment_status_idx ON leads(enrichment_status);
