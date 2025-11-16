-- PODCASTING SUITE TABLES
-- For ingesting, analyzing, and extracting insights from podcasts

-- Podcasts (show/channel level)
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  host TEXT,
  rss_feed_url TEXT,
  youtube_channel_id TEXT,
  website_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Podcast Episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id TEXT PRIMARY KEY,
  podcast_id TEXT REFERENCES podcasts(id) ON DELETE CASCADE,
  episode_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  guest_name TEXT,
  guest_bio TEXT,
  published_date TEXT,
  duration_seconds INTEGER,
  audio_url TEXT,
  video_url TEXT,
  transcript_url TEXT,
  transcript_source TEXT CHECK (transcript_source IN ('youtube', 'rss', 'manual', 'whisper', 'happyscribe', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transcribed', 'analyzed', 'archived')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transcripts (full text of episodes)
CREATE TABLE IF NOT EXISTS podcast_transcripts (
  id TEXT PRIMARY KEY,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  word_count INTEGER,
  language TEXT DEFAULT 'en',
  quality_score REAL,
  transcription_method TEXT CHECK (transcription_method IN ('auto', 'manual', 'ai', 'api')),
  processed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Episode Insights (AI-generated analysis)
CREATE TABLE IF NOT EXISTS podcast_insights (
  id TEXT PRIMARY KEY,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'expert_opinion', 'business_idea', 'technology', 'market_opportunity', 'key_takeaway', 'controversy', 'prediction')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  tags TEXT DEFAULT '[]',
  extracted_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trend Analysis (aggregated trends across episodes)
CREATE TABLE IF NOT EXISTS podcast_trends (
  id TEXT PRIMARY KEY,
  trend_name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('technology', 'business', 'health', 'finance', 'culture', 'science', 'politics', 'other')),
  first_mentioned_date TEXT,
  mention_count INTEGER DEFAULT 0,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  related_episodes TEXT DEFAULT '[]',
  extracted_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Expert Opinions (quotes and viewpoints from guests)
CREATE TABLE IF NOT EXISTS podcast_expert_opinions (
  id TEXT PRIMARY KEY,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  expert_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  opinion_text TEXT NOT NULL,
  timestamp_seconds INTEGER,
  context TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  extracted_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Business Ideas (extracted from episodes)
CREATE TABLE IF NOT EXISTS podcast_business_ideas (
  id TEXT PRIMARY KEY,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,
  idea_description TEXT NOT NULL,
  market_category TEXT,
  potential_value TEXT,
  mentioned_by TEXT,
  related_trends TEXT DEFAULT '[]',
  extracted_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  linked_to_project_id TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Ingestion Jobs (tracking scraping/transcription jobs)
CREATE TABLE IF NOT EXISTS podcast_ingestion_jobs (
  id TEXT PRIMARY KEY,
  podcast_id TEXT REFERENCES podcasts(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('scrape_episodes', 'transcribe', 'analyze', 'update_metadata')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  source_url TEXT,
  parameters TEXT DEFAULT '{}',
  result TEXT,
  error_message TEXT,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast_id ON podcast_episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_date ON podcast_episodes(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_status ON podcast_episodes(status);
CREATE INDEX IF NOT EXISTS idx_podcast_transcripts_episode_id ON podcast_transcripts(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_insights_episode_id ON podcast_insights(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_insights_type ON podcast_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_podcast_trends_category ON podcast_trends(category);
CREATE INDEX IF NOT EXISTS idx_podcast_expert_opinions_episode_id ON podcast_expert_opinions(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_expert_opinions_expert_name ON podcast_expert_opinions(expert_name);
CREATE INDEX IF NOT EXISTS idx_podcast_business_ideas_episode_id ON podcast_business_ideas(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_ingestion_jobs_status ON podcast_ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_podcast_ingestion_jobs_podcast_id ON podcast_ingestion_jobs(podcast_id);

