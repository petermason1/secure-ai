-- VALUE OPTIMIZATION DEPARTMENT TABLES
-- Actions that can add £1M+ in company value instantly

-- Value Optimization Opportunities
CREATE TABLE IF NOT EXISTS value_opportunities (
  id TEXT PRIMARY KEY,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('profit_adjustment', 'gross_margin_improvement', 'revenue_growth_demonstration', 'ip_protection', 'financial_audit', 'tier1_customer', 'tier1_investor', 'pr_media_win', 'feature_release', 'industry_award', 'strategic_partnership')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_state TEXT,
  target_state TEXT,
  estimated_value_impact REAL,
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  effort_level TEXT CHECK (effort_level IN ('low', 'medium', 'high', 'very_high')),
  time_to_complete_days INTEGER,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'in_progress', 'completed', 'blocked', 'cancelled')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Profit Adjustments
CREATE TABLE IF NOT EXISTS profit_adjustments (
  id TEXT PRIMARY KEY,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('owner_salary_reduction', 'one_off_expense_removal', 'market_rate_replacement', 'expense_optimization', 'revenue_recognition')),
  description TEXT NOT NULL,
  current_amount REAL NOT NULL,
  adjusted_amount REAL NOT NULL,
  annual_impact REAL NOT NULL,
  valuation_multiple REAL,
  estimated_value_add REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'implemented', 'rejected')),
  implemented_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  implemented_at TEXT
);

-- Margin Improvements
CREATE TABLE IF NOT EXISTS margin_improvements (
  id TEXT PRIMARY KEY,
  improvement_type TEXT NOT NULL CHECK (improvement_type IN ('pricing_optimization', 'cost_reduction', 'product_bundling', 'upselling', 'cross_selling')),
  current_margin REAL NOT NULL,
  target_margin REAL NOT NULL,
  improvement_percentage REAL,
  estimated_annual_impact REAL,
  estimated_value_add REAL,
  implementation_plan TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'implemented', 'rejected')),
  implemented_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  implemented_at TEXT
);

-- IP Protection Records
CREATE TABLE IF NOT EXISTS ip_protection (
  id TEXT PRIMARY KEY,
  ip_type TEXT NOT NULL CHECK (ip_type IN ('patent', 'trademark', 'copyright', 'trade_secret', 'design_right')),
  ip_name TEXT NOT NULL,
  description TEXT NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'pending' CHECK (filing_status IN ('pending', 'filed', 'pending_approval', 'approved', 'rejected', 'expired')),
  filing_date TEXT,
  approval_date TEXT,
  expiry_date TEXT,
  estimated_value_add REAL,
  protection_scope TEXT,
  managed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tier 1 Relationships (Customers/Investors)
CREATE TABLE IF NOT EXISTS tier1_relationships (
  id TEXT PRIMARY KEY,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('customer', 'investor', 'partner')),
  entity_name TEXT NOT NULL,
  entity_type TEXT,
  contact_name TEXT,
  contact_email TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'identified' CHECK (relationship_status IN ('identified', 'outreach', 'negotiating', 'pilot', 'signed', 'active', 'lost')),
  deal_value REAL,
  estimated_value_add REAL,
  strategic_importance TEXT,
  next_steps TEXT,
  managed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  signed_at TEXT
);

-- PR & Media Wins
CREATE TABLE IF NOT EXISTS pr_media_wins (
  id TEXT PRIMARY KEY,
  win_type TEXT NOT NULL CHECK (win_type IN ('press_feature', 'thought_leadership', 'viral_moment', 'award', 'industry_recognition', 'media_interview')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  publication_platform TEXT,
  publication_date TEXT,
  reach_estimate INTEGER,
  engagement_estimate INTEGER,
  estimated_value_add REAL,
  brand_impact_score REAL CHECK (brand_impact_score BETWEEN 0 AND 1),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'pitched', 'confirmed', 'published', 'archived')),
  managed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);

-- Financial Audit Records
CREATE TABLE IF NOT EXISTS financial_audits (
  id TEXT PRIMARY KEY,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('full_audit', 'review', 'compilation', 'tax_audit')),
  audit_period_start TEXT NOT NULL,
  audit_period_end TEXT NOT NULL,
  auditor_name TEXT,
  auditor_firm TEXT,
  audit_status TEXT NOT NULL DEFAULT 'planned' CHECK (audit_status IN ('planned', 'in_progress', 'completed', 'clean', 'qualified')),
  completion_date TEXT,
  findings TEXT,
  estimated_value_add REAL,
  managed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Value Impact Tracking
CREATE TABLE IF NOT EXISTS value_impact_tracking (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT REFERENCES value_opportunities(id) ON DELETE SET NULL,
  impact_type TEXT NOT NULL,
  baseline_value REAL,
  new_value REAL,
  value_add REAL NOT NULL,
  valuation_date TEXT NOT NULL DEFAULT (date('now')),
  confidence_level REAL CHECK (confidence_level BETWEEN 0 AND 1),
  notes TEXT,
  tracked_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_value_opportunities_type ON value_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_value_opportunities_status ON value_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_value_opportunities_priority ON value_opportunities(priority DESC);
CREATE INDEX IF NOT EXISTS idx_value_opportunities_value_impact ON value_opportunities(estimated_value_impact DESC);
CREATE INDEX IF NOT EXISTS idx_profit_adjustments_status ON profit_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_margin_improvements_status ON margin_improvements(status);
CREATE INDEX IF NOT EXISTS idx_ip_protection_type ON ip_protection(ip_type);
CREATE INDEX IF NOT EXISTS idx_ip_protection_status ON ip_protection(filing_status);
CREATE INDEX IF NOT EXISTS idx_tier1_relationships_type ON tier1_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_tier1_relationships_status ON tier1_relationships(relationship_status);
CREATE INDEX IF NOT EXISTS idx_pr_media_wins_status ON pr_media_wins(status);
CREATE INDEX IF NOT EXISTS idx_value_impact_tracking_date ON value_impact_tracking(valuation_date DESC);

