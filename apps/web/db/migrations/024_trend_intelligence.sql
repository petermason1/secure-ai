-- TREND INTELLIGENCE TABLES
-- For the Trend Intelligence Bot that creates organic trending content

-- Trend Patterns (learned patterns from historical trends)
CREATE TABLE IF NOT EXISTS trend_patterns (
  id TEXT PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('fashion', 'technology', 'culture', 'entertainment', 'business', 'lifestyle', 'other')),
  characteristics TEXT DEFAULT '{}',
  lifecycle_stage TEXT CHECK (lifecycle_stage IN ('introduction', 'rapid_rise', 'mass_adoption', 'oversaturation', 'decline', 'reinvention')),
  cultural_relevance_score REAL CHECK (cultural_relevance_score BETWEEN 0 AND 1),
  novelty_score REAL CHECK (novelty_score BETWEEN 0 AND 1),
  emotional_connection_type TEXT CHECK (emotional_connection_type IN ('status', 'nostalgia', 'rebellion', 'belonging', 'aspiration', 'fear', 'joy')),
  visibility_channels TEXT DEFAULT '[]',
  success_factors TEXT DEFAULT '[]',
  example_trends TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  learned_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trend Analysis (analysis of current trends)
CREATE TABLE IF NOT EXISTS trend_analysis (
  id TEXT PRIMARY KEY,
  trend_topic TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'tiktok', 'youtube', 'reddit', 'all')),
  current_lifecycle_stage TEXT CHECK (current_lifecycle_stage IN ('introduction', 'rapid_rise', 'mass_adoption', 'oversaturation', 'decline', 'reinvention')),
  cultural_relevance_score REAL CHECK (cultural_relevance_score BETWEEN 0 AND 1),
  novelty_score REAL CHECK (novelty_score BETWEEN 0 AND 1),
  emotional_driver TEXT,
  visibility_score REAL CHECK (visibility_score BETWEEN 0 AND 1),
  adoption_rate REAL,
  predicted_peak_date TEXT,
  predicted_decline_date TEXT,
  competitor_content_count INTEGER DEFAULT 0,
  opportunity_score REAL CHECK (opportunity_score BETWEEN 0 AND 1),
  recommended_angle TEXT,
  content_suggestions TEXT DEFAULT '[]',
  analyzed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trending Content Ideas (content generated based on trend analysis)
CREATE TABLE IF NOT EXISTS trending_content_ideas (
  id TEXT PRIMARY KEY,
  trend_analysis_id TEXT REFERENCES trend_analysis(id) ON DELETE SET NULL,
  content_type TEXT CHECK (content_type IN ('post', 'video', 'story', 'reel', 'thread', 'article', 'poll')),
  platform TEXT NOT NULL,
  headline TEXT NOT NULL,
  content_text TEXT NOT NULL,
  visual_elements TEXT DEFAULT '[]',
  hashtags TEXT DEFAULT '[]',
  posting_strategy TEXT,
  expected_engagement_score REAL CHECK (expected_engagement_score BETWEEN 0 AND 1),
  cultural_relevance_score REAL CHECK (cultural_relevance_score BETWEEN 0 AND 1),
  novelty_score REAL CHECK (novelty_score BETWEEN 0 AND 1),
  emotional_connection_score REAL CHECK (emotional_connection_score BETWEEN 0 AND 1),
  organic_potential_score REAL CHECK (organic_potential_score BETWEEN 0 AND 1),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'performed_well', 'performed_poorly')),
  actual_engagement REAL,
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trend Learning Data (data the bot uses to train itself)
CREATE TABLE IF NOT EXISTS trend_learning_data (
  id TEXT PRIMARY KEY,
  trend_name TEXT NOT NULL,
  trend_category TEXT,
  peak_period_start TEXT,
  peak_period_end TEXT,
  lifecycle_duration_days INTEGER,
  cultural_context TEXT,
  emotional_driver TEXT,
  visibility_channels TEXT DEFAULT '[]',
  key_influencers TEXT DEFAULT '[]',
  commercial_amplification BOOLEAN DEFAULT 0,
  organic_vs_paid_ratio REAL,
  success_metrics TEXT DEFAULT '{}',
  failure_factors TEXT DEFAULT '[]',
  lessons_learned TEXT,
  pattern_matched_id TEXT REFERENCES trend_patterns(id) ON DELETE SET NULL,
  learned_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Content Performance (tracking how well generated content performs)
CREATE TABLE IF NOT EXISTS trend_content_performance (
  id TEXT PRIMARY KEY,
  content_idea_id TEXT REFERENCES trending_content_ideas(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate REAL,
  trend_alignment_score REAL CHECK (trend_alignment_score BETWEEN 0 AND 1),
  organic_vs_paid_performance REAL,
  performance_notes TEXT,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT DEFAULT '{}'
);

-- Trend Predictions (bot's predictions about future trends)
CREATE TABLE IF NOT EXISTS trend_predictions (
  id TEXT PRIMARY KEY,
  predicted_trend TEXT NOT NULL,
  category TEXT,
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  predicted_emergence_date TEXT,
  predicted_peak_date TEXT,
  predicted_decline_date TEXT,
  reasoning TEXT,
  supporting_patterns TEXT DEFAULT '[]',
  cultural_indicators TEXT DEFAULT '[]',
  opportunity_level TEXT CHECK (opportunity_level IN ('low', 'medium', 'high', 'very_high')),
  recommended_action TEXT,
  predicted_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trend_patterns_category ON trend_patterns(category);
CREATE INDEX IF NOT EXISTS idx_trend_patterns_lifecycle ON trend_patterns(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_platform ON trend_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_opportunity ON trend_analysis(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_content_ideas_platform ON trending_content_ideas(platform);
CREATE INDEX IF NOT EXISTS idx_trending_content_ideas_status ON trending_content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_trending_content_ideas_organic_potential ON trending_content_ideas(organic_potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_trend_learning_data_category ON trend_learning_data(trend_category);
CREATE INDEX IF NOT EXISTS idx_trend_predictions_confidence ON trend_predictions(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_trend_predictions_opportunity ON trend_predictions(opportunity_level);

