CREATE TABLE IF NOT EXISTS godmode_prompts (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response_json TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
