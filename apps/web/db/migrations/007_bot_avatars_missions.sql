-- BOT AVATARS & MISSIONS

-- Add avatar and mission fields to agents (if not exists via metadata)
-- Missions table for tracking bot missions

CREATE TABLE IF NOT EXISTS bot_missions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('task', 'goal', 'challenge', 'achievement', 'milestone')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  reward TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  deadline TEXT
);

CREATE INDEX IF NOT EXISTS idx_bot_missions_agent ON bot_missions(agent_id);
CREATE INDEX IF NOT EXISTS idx_bot_missions_status ON bot_missions(status);
CREATE INDEX IF NOT EXISTS idx_bot_missions_type ON bot_missions(mission_type);
