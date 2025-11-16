-- CHRISTMAS TRENDS & AMAZON AFFILIATE SYSTEM
-- Tracks trending Christmas products, Amazon affiliate opportunities, and YouTube revenue streams

-- Christmas Trend Products
CREATE TABLE IF NOT EXISTS christmas_trend_products (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_category TEXT,
  amazon_asin TEXT,
  amazon_url TEXT,
  commission_rate REAL DEFAULT 0.0,
  estimated_commission_per_sale REAL DEFAULT 0.0,
  trend_score INTEGER DEFAULT 0 CHECK (trend_score BETWEEN 0 AND 100),
  search_volume INTEGER DEFAULT 0,
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  price_range TEXT,
  target_audience TEXT,
  seasonal_relevance INTEGER DEFAULT 0 CHECK (seasonal_relevance BETWEEN 0 AND 100),
  viral_potential INTEGER DEFAULT 0 CHECK (viral_potential BETWEEN 0 AND 100),
  content_ideas TEXT DEFAULT '[]',
  youtube_video_ideas TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'researching' CHECK (status IN ('researching', 'approved', 'promoted', 'archived')),
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Amazon Affiliate Links
CREATE TABLE IF NOT EXISTS amazon_affiliate_links (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES christmas_trend_products(id) ON DELETE CASCADE,
  affiliate_url TEXT NOT NULL,
  short_url TEXT,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated REAL DEFAULT 0.0,
  platform TEXT CHECK (platform IN ('website', 'youtube', 'social', 'email', 'other')),
  campaign_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- YouTube Content Ideas
CREATE TABLE IF NOT EXISTS youtube_content_ideas (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES christmas_trend_products(id) ON DELETE CASCADE,
  video_title TEXT NOT NULL,
  video_description TEXT,
  video_tags TEXT DEFAULT '[]',
  estimated_views INTEGER DEFAULT 0,
  estimated_revenue REAL DEFAULT 0.0,
  affiliate_links_included TEXT DEFAULT '[]',
  content_type TEXT CHECK (content_type IN ('review', 'unboxing', 'gift_guide', 'comparison', 'tutorial', 'haul')),
  target_keywords TEXT DEFAULT '[]',
  thumbnail_concept TEXT,
  script_outline TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scripted', 'filming', 'edited', 'published', 'archived')),
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Revenue Tracking
CREATE TABLE IF NOT EXISTS affiliate_revenue (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES christmas_trend_products(id) ON DELETE CASCADE,
  affiliate_link_id TEXT REFERENCES amazon_affiliate_links(id) ON DELETE SET NULL,
  youtube_video_id TEXT REFERENCES youtube_content_ideas(id) ON DELETE SET NULL,
  revenue_amount REAL NOT NULL DEFAULT 0.0,
  currency TEXT DEFAULT 'GBP',
  sale_date TEXT NOT NULL,
  commission_type TEXT CHECK (commission_type IN ('amazon_affiliate', 'youtube_ad', 'sponsorship', 'other')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_christmas_products_trend_score ON christmas_trend_products(trend_score);
CREATE INDEX IF NOT EXISTS idx_christmas_products_status ON christmas_trend_products(status);
CREATE INDEX IF NOT EXISTS idx_amazon_affiliate_product_id ON amazon_affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_youtube_content_product_id ON youtube_content_ideas(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_revenue_product_id ON affiliate_revenue(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_revenue_date ON affiliate_revenue(sale_date);

