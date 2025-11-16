-- HR, Legal, Policy/Governance, and Recruitment Tables

-- HR Department Tables
CREATE TABLE IF NOT EXISTS hr_onboarding (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  department TEXT,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  documents_required TEXT DEFAULT '[]',
  documents_completed TEXT DEFAULT '[]',
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hr_contracts (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('full_time', 'part_time', 'contractor', 'consultant', 'fractional')),
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  salary_amount REAL,
  salary_currency TEXT DEFAULT 'GBP',
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'expired', 'terminated')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hr_reviews (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('performance', 'probation', 'annual', 'exit')),
  review_period_start TEXT,
  review_period_end TEXT,
  reviewer_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scores TEXT DEFAULT '{}',
  feedback TEXT,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hr_leave_tracking (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  days_requested REAL NOT NULL,
  days_approved REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approver_id TEXT,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Legal Department Tables
CREATE TABLE IF NOT EXISTS legal_contracts (
  id TEXT PRIMARY KEY,
  contract_name TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('nda', 'msa', 'sla', 'employment', 'partnership', 'vendor', 'customer', 'other')),
  parties TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'negotiation', 'approved', 'signed', 'expired', 'terminated')),
  version INTEGER NOT NULL DEFAULT 1,
  parent_contract_id TEXT REFERENCES legal_contracts(id) ON DELETE SET NULL,
  terms TEXT,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_risk_assessments (
  id TEXT PRIMARY KEY,
  assessment_name TEXT NOT NULL,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('compliance', 'legal', 'financial', 'operational', 'reputational', 'data_privacy', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'resolved', 'accepted')),
  description TEXT NOT NULL,
  mitigation_plan TEXT,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_policies (
  id TEXT PRIMARY KEY,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('privacy', 'terms', 'code_of_conduct', 'data_protection', 'security', 'compliance', 'other')),
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  content TEXT NOT NULL,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Policy/Governance Department Tables
CREATE TABLE IF NOT EXISTS policy_guidelines (
  id TEXT PRIMARY KEY,
  guideline_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ethics', 'privacy', 'security', 'compliance', 'operations', 'communication', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS policy_audits (
  id TEXT PRIMARY KEY,
  audit_name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('compliance', 'security', 'privacy', 'ethics', 'operations', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  findings TEXT DEFAULT '[]',
  recommendations TEXT DEFAULT '[]',
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS policy_qa (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT CHECK (category IN ('rules', 'ethics', 'privacy', 'compliance', 'operations', 'other')),
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated', 'archived')),
  asked_by TEXT,
  answered_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT
);

-- Recruitment Consultant Tables
CREATE TABLE IF NOT EXISTS recruitment_recommendations (
  id TEXT PRIMARY KEY,
  role_title TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('full_time', 'part_time', 'fractional', 'contractor', 'consultant', 'freelance')),
  department TEXT,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  priority_score REAL NOT NULL DEFAULT 0,
  skill_gaps TEXT DEFAULT '[]',
  required_skills TEXT DEFAULT '[]',
  recommended_skills TEXT DEFAULT '[]',
  cost_estimate_min REAL,
  cost_estimate_max REAL,
  cost_currency TEXT DEFAULT 'GBP',
  impact_forecast TEXT,
  revenue_impact REAL,
  timeline_weeks INTEGER,
  status TEXT NOT NULL DEFAULT 'recommended' CHECK (status IN ('recommended', 'approved', 'hiring', 'filled', 'cancelled')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recruitment_hiring_plan (
  id TEXT PRIMARY KEY,
  plan_name TEXT NOT NULL,
  target_revenue REAL,
  target_timeline_months INTEGER,
  recommendations TEXT DEFAULT '[]',
  total_cost_estimate REAL,
  total_revenue_impact REAL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hr_onboarding_status ON hr_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_hr_contracts_status ON hr_contracts(status);
CREATE INDEX IF NOT EXISTS idx_hr_reviews_status ON hr_reviews(status);
CREATE INDEX IF NOT EXISTS idx_hr_leave_status ON hr_leave_tracking(status);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_status ON legal_contracts(status);
CREATE INDEX IF NOT EXISTS idx_legal_risk_severity ON legal_risk_assessments(severity);
CREATE INDEX IF NOT EXISTS idx_legal_policies_type ON legal_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_policy_guidelines_category ON policy_guidelines(category);
CREATE INDEX IF NOT EXISTS idx_policy_audits_type ON policy_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_policy_qa_status ON policy_qa(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_urgency ON recruitment_recommendations(urgency);
CREATE INDEX IF NOT EXISTS idx_recruitment_priority ON recruitment_recommendations(priority_score DESC);

