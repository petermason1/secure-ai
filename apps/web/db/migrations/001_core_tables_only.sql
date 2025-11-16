-- CORE INFRASTRUCTURE TABLES (SQLite/Turso Compatible)
-- ONLY CREATE TABLE STATEMENTS - Run this first!

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  config TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agents (all AI agents across departments)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ai' CHECK (type IN ('ai', 'human', 'hybrid')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
  capabilities TEXT DEFAULT '[]',
  config TEXT DEFAULT '{}',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agent Messages (Bot Data Centre)
CREATE TABLE IF NOT EXISTS agent_messages (
  id TEXT PRIMARY KEY,
  from_agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  to_agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('request', 'response', 'notification', 'alert', 'coordination')),
  content TEXT NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'read', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_at TEXT,
  expires_at TEXT
);

-- Conflicts (Bot Data Centre)
CREATE TABLE IF NOT EXISTS conflicts (
  id TEXT PRIMARY KEY,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('priority', 'action', 'resource', 'timeline', 'ethical', 'business')),
  agent_ids TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'resolving', 'resolved', 'escalated')),
  resolution TEXT,
  resolved_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- Files (Storage & Filing)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('document', 'image', 'video', 'audio', 'other')),
  mime_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Messages (Post Team)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('email', 'slack', 'sms', 'webhook', 'manual', 'other')),
  sender TEXT NOT NULL,
  recipient TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  attachments TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'routed', 'completed', 'failed')),
  routed_to_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

-- Decisions (AI Decision System)
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  decision_maker_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  options TEXT DEFAULT '[]',
  selected_option TEXT,
  reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT
);

-- Iterations (Cloud Agent Iteration System)
CREATE TABLE IF NOT EXISTS iterations (
  id TEXT PRIMARY KEY,
  problem TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed')),
  best_solution TEXT,
  best_score REAL,
  solutions TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Snapshots (Snapshot System)
CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('project', 'department', 'agent', 'full')),
  data TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit Logs (All Departments)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details TEXT DEFAULT '{}',
  cost REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

