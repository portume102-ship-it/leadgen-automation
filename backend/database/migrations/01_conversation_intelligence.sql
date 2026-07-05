-- backend/database/migrations/01_conversation_intelligence.sql
-- UP Migration: Creates tables, triggers, and indexes for the Conversation Intelligence System

-- 1. Helper trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. business_profiles Table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE, -- References leads(id) without modifying the leads table
  business_name TEXT,
  industry TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. conversation_states Table
CREATE TABLE IF NOT EXISTS conversation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES business_profiles(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL DEFAULT 'lead_qualified',
  last_contacted_at TIMESTAMPTZ,
  next_action TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. conversation_messages Table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_state_id UUID NOT NULL REFERENCES conversation_states(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms', 'call')),
  sender TEXT,
  recipient TEXT,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. business_observations Table
CREATE TABLE IF NOT EXISTS business_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  observation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 1.0,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. business_research Table
CREATE TABLE IF NOT EXISTS business_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  research_topic TEXT NOT NULL,
  findings JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  source_urls TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. business_memory Table
CREATE TABLE IF NOT EXISTS business_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES business_profiles(id) ON DELETE CASCADE,
  key_insights TEXT[] DEFAULT '{}'::text[],
  preferences JSONB DEFAULT '{}'::jsonb,
  objections_raised TEXT[] DEFAULT '{}'::text[],
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. followup_queue Table
CREATE TABLE IF NOT EXISTS followup_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reason TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. meeting_history Table
CREATE TABLE IF NOT EXISTS meeting_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'no_show', 'cancelled')),
  notes TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. message_logs Table
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  gateway_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Create update triggers for all tables to maintain updated_at automatically
CREATE TRIGGER trg_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_conversation_states_updated_at BEFORE UPDATE ON conversation_states FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_conversation_messages_updated_at BEFORE UPDATE ON conversation_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_business_observations_updated_at BEFORE UPDATE ON business_observations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_business_research_updated_at BEFORE UPDATE ON business_research FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_business_memory_updated_at BEFORE UPDATE ON business_memory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_followup_queue_updated_at BEFORE UPDATE ON followup_queue FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_attachments_updated_at BEFORE UPDATE ON attachments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_meeting_history_updated_at BEFORE UPDATE ON meeting_history FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_message_logs_updated_at BEFORE UPDATE ON message_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 13. Create indexes to speed up foreign key joins and common query lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_lead_id ON business_profiles(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversation_states_business_id ON conversation_states(business_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_state_id ON conversation_messages(conversation_state_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_channel ON conversation_messages(channel);
CREATE INDEX IF NOT EXISTS idx_business_observations_business_id ON business_observations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_research_business_id ON business_research(business_id);
CREATE INDEX IF NOT EXISTS idx_business_memory_business_id ON business_memory(business_id);
CREATE INDEX IF NOT EXISTS idx_followup_queue_business_id ON followup_queue(business_id);
CREATE INDEX IF NOT EXISTS idx_followup_queue_scheduled_at ON followup_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_followup_queue_status ON followup_queue(status);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_meeting_history_business_id ON meeting_history(business_id);
CREATE INDEX IF NOT EXISTS idx_meeting_history_scheduled_at ON meeting_history(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_message_logs_message_id ON message_logs(message_id);
