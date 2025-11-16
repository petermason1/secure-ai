-- BLOG DEPARTMENT TABLES
-- Autonomous daily blog post creation

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Why.ai Blog Team',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  tags TEXT DEFAULT '[]',
  seo_keywords TEXT,
  seo_description TEXT,
  featured_image_url TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blog Topics (for content planning)
CREATE TABLE IF NOT EXISTS blog_topics (
  id TEXT PRIMARY KEY,
  topic_title TEXT NOT NULL,
  topic_description TEXT,
  category TEXT,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  target_audience TEXT,
  keywords TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  assigned_to_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  scheduled_for_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blog Analytics
CREATE TABLE IF NOT EXISTS blog_analytics (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate REAL DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_id, date)
);

-- Blog Content Calendar
CREATE TABLE IF NOT EXISTS blog_content_calendar (
  id TEXT PRIMARY KEY,
  scheduled_date TEXT NOT NULL,
  post_id TEXT REFERENCES blog_posts(id) ON DELETE SET NULL,
  topic_id TEXT REFERENCES blog_topics(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'skipped', 'rescheduled')),
  notes TEXT,
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_topics_status ON blog_topics(status);
CREATE INDEX IF NOT EXISTS idx_blog_topics_scheduled_for_date ON blog_topics(scheduled_for_date);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_date ON blog_analytics(date);
CREATE INDEX IF NOT EXISTS idx_blog_calendar_scheduled_date ON blog_content_calendar(scheduled_date);

