-- SEO DEPARTMENT TABLES

-- Keywords (tracked keywords for ranking)
CREATE TABLE IF NOT EXISTS seo_keywords (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty_score REAL,
  cpc REAL,
  intent TEXT CHECK (intent IN ('informational', 'navigational', 'transactional', 'commercial')),
  category TEXT,
  target_url TEXT,
  status TEXT NOT NULL DEFAULT 'tracking' CHECK (status IN ('tracking', 'paused', 'archived')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Keyword Rankings (historical ranking data)
CREATE TABLE IF NOT EXISTS seo_rankings (
  id TEXT PRIMARY KEY,
  keyword_id TEXT REFERENCES seo_keywords(id) ON DELETE CASCADE,
  position INTEGER,
  url TEXT,
  search_engine TEXT DEFAULT 'google' CHECK (search_engine IN ('google', 'bing', 'yahoo', 'duckduckgo')),
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  location TEXT,
  date TEXT NOT NULL DEFAULT (date('now')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Backlinks (incoming links)
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  link_type TEXT CHECK (link_type IN ('dofollow', 'nofollow', 'sponsored', 'ugc')),
  domain_authority INTEGER,
  spam_score INTEGER,
  first_seen_date TEXT,
  last_checked_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lost', 'pending', 'rejected')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Content Optimization (on-page SEO analysis)
CREATE TABLE IF NOT EXISTS seo_content_optimization (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  h2_tags TEXT DEFAULT '[]',
  word_count INTEGER,
  keyword_density REAL,
  readability_score REAL,
  internal_links_count INTEGER,
  external_links_count INTEGER,
  images_count INTEGER,
  images_alt_text_count INTEGER,
  schema_markup TEXT DEFAULT '[]',
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN,
  seo_score INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  recommendations TEXT DEFAULT '[]',
  analyzed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Competitor Analysis
CREATE TABLE IF NOT EXISTS seo_competitors (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  name TEXT,
  domain_authority INTEGER,
  backlinks_count INTEGER,
  organic_keywords_count INTEGER,
  organic_traffic_estimate INTEGER,
  top_keywords TEXT DEFAULT '[]',
  analyzed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SEO Tasks (automated tasks and campaigns)
CREATE TABLE IF NOT EXISTS seo_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('keyword_research', 'content_optimization', 'link_building', 'technical_audit', 'competitor_analysis', 'rankings_check', 'schema_markup', 'local_optimization')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  target_url TEXT,
  parameters TEXT DEFAULT '{}',
  result TEXT,
  error_message TEXT,
  scheduled_for TEXT,
  completed_at TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Local SEO (if applicable)
CREATE TABLE IF NOT EXISTS seo_local_listings (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website_url TEXT,
  google_business_profile_id TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'suspended', 'inactive')),
  citations_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  average_rating REAL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SEO Reports (aggregated performance reports)
CREATE TABLE IF NOT EXISTS seo_reports (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  total_keywords_tracked INTEGER,
  average_position REAL,
  total_backlinks INTEGER,
  new_backlinks INTEGER,
  organic_traffic_estimate INTEGER,
  top_performing_keywords TEXT DEFAULT '[]',
  recommendations TEXT DEFAULT '[]',
  generated_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seo_keywords_status ON seo_keywords(status);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_category ON seo_keywords(category);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_keyword_id ON seo_rankings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_date ON seo_rankings(date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_target_url ON seo_backlinks(target_url);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_status ON seo_backlinks(status);
CREATE INDEX IF NOT EXISTS idx_seo_content_optimization_url ON seo_content_optimization(url);
CREATE INDEX IF NOT EXISTS idx_seo_competitors_domain ON seo_competitors(domain);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_status ON seo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_type ON seo_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_seo_local_listings_status ON seo_local_listings(status);
CREATE INDEX IF NOT EXISTS idx_seo_reports_period ON seo_reports(period_start, period_end);

