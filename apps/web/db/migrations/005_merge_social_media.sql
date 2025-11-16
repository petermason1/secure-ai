-- MERGE: Social Media Department Tables
-- Adds social media tables to existing infrastructure

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'facebook')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'rejected', 'failed')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  source_type TEXT, -- 'feature_launch', 'blog_post', 'customer_win', 'manual'
  source_id UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Schedule Table
CREATE TABLE IF NOT EXISTS social_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  external_post_id TEXT, -- ID from Twitter/LinkedIn API
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Engagement Table
CREATE TABLE IF NOT EXISTS social_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('comment', 'dm', 'mention', 'reply', 'like', 'share')),
  from_user TEXT NOT NULL,
  from_user_handle TEXT,
  content TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  response TEXT,
  responded_by TEXT CHECK (responded_by IN ('agent', 'human')),
  responded_at TIMESTAMPTZ,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Analytics Table
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('likes', 'shares', 'comments', 'clicks', 'impressions', 'conversions')),
  metric_value INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Partnerships Table
CREATE TABLE IF NOT EXISTS social_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  outreach_status TEXT DEFAULT 'identified' CHECK (outreach_status IN ('identified', 'drafted', 'sent', 'responded', 'active', 'declined')),
  outreach_message TEXT,
  sent_at TIMESTAMPTZ,
  response TEXT,
  responded_at TIMESTAMPTZ,
  partnership_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Voice Table
CREATE TABLE IF NOT EXISTS brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL UNIQUE,
  tone TEXT, -- 'professional', 'casual', 'technical', 'friendly'
  vocabulary JSONB, -- preferred words, phrases to avoid
  examples TEXT[], -- sample approved posts
  guidelines TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_department ON social_posts(department_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_schedule_scheduled_time ON social_schedule(scheduled_time) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_social_schedule_post_id ON social_schedule(post_id);
CREATE INDEX IF NOT EXISTS idx_social_engagement_department ON social_engagement(department_id);
CREATE INDEX IF NOT EXISTS idx_social_engagement_responded ON social_engagement(responded_at) WHERE responded_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON social_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_recorded ON social_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_social_partnerships_department ON social_partnerships(department_id);
CREATE INDEX IF NOT EXISTS idx_social_partnerships_status ON social_partnerships(outreach_status);
CREATE INDEX IF NOT EXISTS idx_brand_voice_department ON brand_voice(department_id);

-- Updated_at triggers
CREATE TRIGGER social_posts_updated_at BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER brand_voice_updated_at BEFORE UPDATE ON brand_voice
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper Functions
CREATE OR REPLACE FUNCTION get_pending_posts()
RETURNS TABLE (
  post_id UUID,
  platform TEXT,
  content TEXT,
  scheduled_for TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.platform,
    sp.content,
    sp.scheduled_for
  FROM social_posts sp
  WHERE sp.status = 'scheduled'
    AND sp.scheduled_for <= NOW()
  ORDER BY sp.scheduled_for ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

