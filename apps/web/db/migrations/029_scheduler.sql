-- Scheduler Tables

CREATE TABLE IF NOT EXISTS schedule_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  location TEXT,
  created_by TEXT DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_schedule_events_start_time ON schedule_events(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_events_status ON schedule_events(status);

-- Seed the AI virtual team meeting for today at 10am UTC
INSERT OR IGNORE INTO schedule_events (
  id,
  title,
  description,
  start_time,
  end_time,
  timezone,
  location,
  created_by,
  tags
) VALUES (
  'ai-virtual-team-meeting',
  'AI Virtual Team Meeting',
  'Discuss scheduler improvements and independence handbook follow-ups.',
  datetime('now','start of day','+10 hours'),
  datetime('now','start of day','+11 hours'),
  'UTC',
  'Virtual',
  'system',
  '["ai","team","scheduler"]'
);

