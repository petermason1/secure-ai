-- SECURITY ADVISORY & PRIVACY TABLES

-- Security Advisories (Q&A with status tracking)
CREATE TABLE IF NOT EXISTS security_advisories (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated', 'resolved', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  asked_by TEXT,
  answered_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  response TEXT,
  advisory_data TEXT DEFAULT '{}',
  tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT,
  resolved_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Security Alerts & Issues
CREATE TABLE IF NOT EXISTS security_alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('privacy', 'code_access', 'data_breach', 'compliance', 'vulnerability', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive', 'archived')),
  assigned_to_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  resolution TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Security Best Practices
CREATE TABLE IF NOT EXISTS security_best_practices (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('privacy', 'code_protection', 'access_control', 'data_encryption', 'compliance', 'api_security', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  do_items TEXT DEFAULT '[]',
  dont_items TEXT DEFAULT '[]',
  checklist_items TEXT DEFAULT '[]',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deprecated')),
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Security Audit Log
CREATE TABLE IF NOT EXISTS security_audit_log (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL CHECK (action_type IN ('advisory_requested', 'advisory_answered', 'alert_created', 'alert_resolved', 'review_requested', 'review_completed', 'access_granted', 'access_revoked', 'policy_updated', 'other')),
  user_id TEXT,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  resource_type TEXT,
  resource_id TEXT,
  action_description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Code/IP Review Requests
CREATE TABLE IF NOT EXISTS security_review_requests (
  id TEXT PRIMARY KEY,
  review_type TEXT NOT NULL CHECK (review_type IN ('code', 'image', 'ip', 'document', 'api_endpoint', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_changes', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  requested_by TEXT,
  reviewed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  review_findings TEXT,
  recommendations TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Security Team Members (human advisors)
CREATE TABLE IF NOT EXISTS security_team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'security_lead', 'advisor', 'auditor', 'guest')),
  expertise TEXT DEFAULT '[]',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'away')),
  last_activity TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_advisories_status ON security_advisories(status);
CREATE INDEX IF NOT EXISTS idx_security_advisories_priority ON security_advisories(priority DESC);
CREATE INDEX IF NOT EXISTS idx_security_advisories_asked_by ON security_advisories(asked_by);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_best_practices_category ON security_best_practices(category);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_review_requests_status ON security_review_requests(status);
CREATE INDEX IF NOT EXISTS idx_security_review_requests_priority ON security_review_requests(priority DESC);
CREATE INDEX IF NOT EXISTS idx_security_team_members_role ON security_team_members(role);
CREATE INDEX IF NOT EXISTS idx_security_team_members_status ON security_team_members(status);


