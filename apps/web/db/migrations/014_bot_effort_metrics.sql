-- Bot Effort Metrics Tables
-- Tracks workload, time, and resources applied to each bot

CREATE TABLE IF NOT EXISTS bot_effort_metrics (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('time_spent', 'tasks_assigned', 'resources_allocated', 'priority_boost', 'manual_intervention')),
  value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'hours', -- hours, count, percentage, etc.
  period_start TEXT NOT NULL, -- ISO timestamp
  period_end TEXT, -- ISO timestamp (null for ongoing)
  metadata TEXT DEFAULT '{}', -- Additional context
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bot_effort_agent ON bot_effort_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_bot_effort_type ON bot_effort_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_bot_effort_period ON bot_effort_metrics(period_start, period_end);

-- Effort allocation records (when you manually apply effort to a bot)
CREATE TABLE IF NOT EXISTS effort_allocations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  allocated_by TEXT, -- User ID or 'system'
  effort_amount REAL NOT NULL, -- Hours, points, or percentage
  effort_type TEXT NOT NULL CHECK (effort_type IN ('time', 'priority', 'resources', 'focus')),
  reason TEXT,
  duration_minutes INTEGER, -- How long this allocation should last
  expires_at TEXT, -- When this allocation expires
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_effort_allocations_agent ON effort_allocations(agent_id);
CREATE INDEX IF NOT EXISTS idx_effort_allocations_expires ON effort_allocations(expires_at);

-- Daily effort summaries for quick queries
CREATE TABLE IF NOT EXISTS bot_effort_daily_summary (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  total_hours REAL NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  priority_boost REAL NOT NULL DEFAULT 0, -- 0-100 scale
  resources_allocated REAL NOT NULL DEFAULT 0,
  effort_score REAL NOT NULL DEFAULT 0, -- Calculated composite score
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(agent_id, date)
);

CREATE INDEX IF NOT EXISTS idx_effort_daily_agent_date ON bot_effort_daily_summary(agent_id, date);
CREATE INDEX IF NOT EXISTS idx_effort_daily_date ON bot_effort_daily_summary(date);
