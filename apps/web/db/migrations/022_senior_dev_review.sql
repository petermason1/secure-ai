-- SENIOR DEV CODE REVIEW TABLES
-- Non-AI code expert who reviews AI-generated code using traditional methods

-- Code Reviews (reviews of code files/PRs)
CREATE TABLE IF NOT EXISTS senior_dev_reviews (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_content TEXT NOT NULL,
  language TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('full_review', 'security_audit', 'performance_check', 'best_practices', 'bug_hunt', 'refactor_suggestion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'needs_discussion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reviewed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Issues (issues found during review)
CREATE TABLE IF NOT EXISTS senior_dev_issues (
  id TEXT PRIMARY KEY,
  review_id TEXT REFERENCES senior_dev_reviews(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('bug', 'security', 'performance', 'code_smell', 'anti_pattern', 'best_practice', 'accessibility', 'maintainability', 'documentation')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  line_number INTEGER,
  code_snippet TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stack_overflow_reference TEXT,
  suggested_fix TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'fixed', 'wont_fix', 'false_positive')),
  fixed_by TEXT,
  fixed_at TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stack Overflow Lookups (references to SO solutions)
CREATE TABLE IF NOT EXISTS senior_dev_stackoverflow_refs (
  id TEXT PRIMARY KEY,
  issue_id TEXT REFERENCES senior_dev_issues(id) ON DELETE CASCADE,
  question_id TEXT,
  question_title TEXT,
  question_url TEXT,
  answer_id TEXT,
  answer_snippet TEXT,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  lookup_method TEXT CHECK (lookup_method IN ('search', 'similar_issue', 'manual_reference')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Patterns (known patterns and anti-patterns)
CREATE TABLE IF NOT EXISTS senior_dev_patterns (
  id TEXT PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('anti_pattern', 'best_practice', 'common_mistake', 'design_pattern')),
  language TEXT,
  description TEXT NOT NULL,
  example_code TEXT,
  why_bad TEXT,
  how_to_fix TEXT,
  stack_overflow_tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Review Sessions (batches of reviews)
CREATE TABLE IF NOT EXISTS senior_dev_sessions (
  id TEXT PRIMARY KEY,
  session_name TEXT NOT NULL,
  description TEXT,
  target_directory TEXT,
  file_patterns TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'reviewing', 'completed', 'failed')),
  files_scanned INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  reviewed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  started_at TEXT,
  completed_at TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Metrics (code quality metrics)
CREATE TABLE IF NOT EXISTS senior_dev_metrics (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  language TEXT,
  lines_of_code INTEGER,
  cyclomatic_complexity INTEGER,
  function_count INTEGER,
  class_count INTEGER,
  comment_ratio REAL,
  test_coverage REAL,
  maintainability_index REAL,
  technical_debt_hours REAL,
  reviewed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_senior_dev_reviews_status ON senior_dev_reviews(status);
CREATE INDEX IF NOT EXISTS idx_senior_dev_reviews_file_path ON senior_dev_reviews(file_path);
CREATE INDEX IF NOT EXISTS idx_senior_dev_issues_review_id ON senior_dev_issues(review_id);
CREATE INDEX IF NOT EXISTS idx_senior_dev_issues_severity ON senior_dev_issues(severity DESC);
CREATE INDEX IF NOT EXISTS idx_senior_dev_issues_status ON senior_dev_issues(status);
CREATE INDEX IF NOT EXISTS idx_senior_dev_stackoverflow_issue_id ON senior_dev_stackoverflow_refs(issue_id);
CREATE INDEX IF NOT EXISTS idx_senior_dev_patterns_type ON senior_dev_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_senior_dev_sessions_status ON senior_dev_sessions(status);
CREATE INDEX IF NOT EXISTS idx_senior_dev_metrics_file_path ON senior_dev_metrics(file_path);

