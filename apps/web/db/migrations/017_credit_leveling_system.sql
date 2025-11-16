-- Credit & Leveling System
-- Tracks credits purchased, spent, and unlocks features based on level

CREATE TABLE IF NOT EXISTS user_credits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  credits_purchased REAL NOT NULL DEFAULT 0,
  credits_spent REAL NOT NULL DEFAULT 0,
  credits_remaining REAL NOT NULL DEFAULT 0,
  total_spent_gbp REAL NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_level ON user_credits(level);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund', 'bonus')),
  amount REAL NOT NULL,
  description TEXT,
  related_resource_type TEXT, -- 'bot_operation', 'meeting', 'scrum', 'ceo_call', etc.
  related_resource_id TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- Feature unlocks (what features are available at each level)
CREATE TABLE IF NOT EXISTS feature_unlocks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature_name TEXT NOT NULL, -- 'meetings', 'scrum_calls', 'ceo_access', 'advanced_analytics', etc.
  unlocked_at_level INTEGER NOT NULL,
  unlocked_at TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feature_unlocks_user ON feature_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_unlocks_feature ON feature_unlocks(feature_name);

-- Level definitions (what unlocks at each level)
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  level_name TEXT NOT NULL,
  experience_required REAL NOT NULL,
  credits_spent_required REAL NOT NULL,
  unlocked_features TEXT NOT NULL DEFAULT '[]', -- JSON array of feature names
  benefits TEXT, -- Description of level benefits
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pre-populate level definitions
INSERT OR IGNORE INTO level_definitions (level, level_name, experience_required, credits_spent_required, unlocked_features, benefits) VALUES
(1, 'Starter', 0, 0, '["basic_bots", "view_dashboard"]', 'Basic bot access, view dashboard'),
(2, 'Explorer', 100, 10, '["meetings", "basic_analytics"]', 'Unlock meetings, basic analytics'),
(3, 'Collaborator', 300, 30, '["scrum_calls", "team_chat"]', 'Unlock scrum calls, team chat'),
(4, 'Manager', 600, 60, '["advanced_analytics", "custom_bots"]', 'Advanced analytics, custom bots'),
(5, 'Executive', 1000, 100, '["ceo_access", "priority_support"]', 'CEO access, priority support'),
(6, 'Director', 2000, 200, '["api_access", "white_label"]', 'API access, white-label options'),
(7, 'C-Suite', 5000, 500, '["enterprise_features", "dedicated_support"]', 'Enterprise features, dedicated support');
