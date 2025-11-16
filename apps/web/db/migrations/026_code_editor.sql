-- CODE EDITOR DEPARTMENT TABLES
-- AI-powered code editor similar to Cursor, embedded in web app

-- Code Projects
CREATE TABLE IF NOT EXISTS code_projects (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  framework TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Files
CREATE TABLE IF NOT EXISTS code_files (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES code_projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_content TEXT NOT NULL DEFAULT '',
  language TEXT,
  file_type TEXT CHECK (file_type IN ('code', 'config', 'documentation', 'test', 'other')),
  size_bytes INTEGER DEFAULT 0,
  last_modified TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, file_path)
);

-- AI Code Suggestions (autocomplete, refactoring, etc.)
CREATE TABLE IF NOT EXISTS ai_code_suggestions (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES code_files(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('autocomplete', 'refactor', 'fix', 'optimize', 'document', 'test', 'explain')),
  code_context TEXT NOT NULL,
  suggested_code TEXT NOT NULL,
  explanation TEXT,
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  line_number INTEGER,
  character_position INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'modified')),
  generated_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  applied_at TEXT
);

-- AI Chat Conversations (chat with AI about code)
CREATE TABLE IF NOT EXISTS ai_code_chat (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES code_projects(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  message_content TEXT NOT NULL,
  code_context TEXT,
  file_references TEXT DEFAULT '[]',
  response_time_ms INTEGER,
  tokens_used INTEGER,
  responded_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Reviews (AI code review)
CREATE TABLE IF NOT EXISTS code_reviews (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES code_files(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('full_review', 'security', 'performance', 'best_practices', 'bug_hunt')),
  issues_found TEXT DEFAULT '[]',
  suggestions TEXT DEFAULT '[]',
  review_score INTEGER CHECK (review_score BETWEEN 0 AND 100),
  reviewed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Completions (autocomplete history)
CREATE TABLE IF NOT EXISTS code_completions (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES code_files(id) ON DELETE CASCADE,
  completion_text TEXT NOT NULL,
  prefix_text TEXT NOT NULL,
  language TEXT,
  accepted BOOLEAN DEFAULT 0,
  completion_time_ms INTEGER,
  generated_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Terminal Commands (terminal history)
CREATE TABLE IF NOT EXISTS terminal_commands (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES code_projects(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  output TEXT,
  exit_code INTEGER,
  executed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code Snippets (saved code snippets)
CREATE TABLE IF NOT EXISTS code_snippets (
  id TEXT PRIMARY KEY,
  snippet_name TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT,
  description TEXT,
  tags TEXT DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_code_projects_status ON code_projects(status);
CREATE INDEX IF NOT EXISTS idx_code_files_project_id ON code_files(project_id);
CREATE INDEX IF NOT EXISTS idx_code_files_file_path ON code_files(file_path);
CREATE INDEX IF NOT EXISTS idx_ai_code_suggestions_file_id ON ai_code_suggestions(file_id);
CREATE INDEX IF NOT EXISTS idx_ai_code_suggestions_status ON ai_code_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_ai_code_chat_project_id ON ai_code_chat(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_code_chat_session_id ON ai_code_chat(session_id);
CREATE INDEX IF NOT EXISTS idx_code_reviews_file_id ON code_reviews(file_id);
CREATE INDEX IF NOT EXISTS idx_code_completions_file_id ON code_completions(file_id);
CREATE INDEX IF NOT EXISTS idx_terminal_commands_project_id ON terminal_commands(project_id);

