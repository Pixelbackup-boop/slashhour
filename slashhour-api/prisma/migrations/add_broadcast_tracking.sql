-- Migration: Add Broadcast Message Tracking
-- Created: 2025-11-17
-- Purpose: Track broadcast announcements with detailed analytics

-- Create broadcast_messages table
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,

  -- Message content
  message TEXT NOT NULL,
  target_group VARCHAR(50) NOT NULL, -- 'all', 'new_users', 'active_users', 'business_owners', 'consumers'

  -- Stats
  users_targeted INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_delivered INTEGER NOT NULL DEFAULT 0,
  messages_read INTEGER NOT NULL DEFAULT 0,
  conversations_created INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,

  -- Link tracking
  contains_links BOOLEAN DEFAULT false,
  links JSONB, -- Array of {url: string, clicks: number, unique_users: string[]}
  total_link_clicks INTEGER DEFAULT 0,

  -- Metadata
  category VARCHAR(50), -- 'promotion', 'update', 'alert', 'announcement'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft' -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
);

-- Create indexes for broadcast_messages
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_admin_id ON broadcast_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_sent_at ON broadcast_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_target_group ON broadcast_messages(target_group);

-- Create broadcast_link_clicks table
CREATE TABLE IF NOT EXISTS broadcast_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Additional tracking
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for broadcast_link_clicks
CREATE INDEX IF NOT EXISTS idx_broadcast_link_clicks_broadcast_id ON broadcast_link_clicks(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_link_clicks_user_id ON broadcast_link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_link_clicks_clicked_at ON broadcast_link_clicks(clicked_at);

-- Add broadcast_id to messages table to link messages to broadcasts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES broadcast_messages(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_broadcast_id ON messages(broadcast_id);

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50),
  target_group VARCHAR(50),

  -- Usage stats
  times_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_admin_id ON message_templates(admin_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);

-- Add updated_at trigger for broadcast_messages
CREATE OR REPLACE FUNCTION update_broadcast_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER broadcast_messages_updated_at
BEFORE UPDATE ON broadcast_messages
FOR EACH ROW
EXECUTE FUNCTION update_broadcast_messages_updated_at();

-- Add updated_at trigger for message_templates
CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_templates_updated_at
BEFORE UPDATE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION update_message_templates_updated_at();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON broadcast_messages TO your_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON broadcast_link_clicks TO your_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON message_templates TO your_api_user;
