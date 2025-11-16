import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate trending content based on trend analysis
 * Uses the 6 characteristics to create content that will trend organically
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { trend_analysis_id, platform, content_type = 'post' } = body;

    if (!trend_analysis_id || !platform) {
      return NextResponse.json(
        { error: 'trend_analysis_id and platform are required' },
        { status: 400 }
      );
    }

    // Get trend analysis
    const analysisResult = await turso.execute({
      sql: `SELECT * FROM trend_analysis WHERE id = ?`,
      args: [trend_analysis_id],
    });

    if (analysisResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Trend analysis not found' },
        { status: 404 }
      );
    }

    const analysis = analysisResult.rows[0];

    // Get Trend Intelligence Bot
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Trend Intelligence%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Generate content using the 6 characteristics
    const contentPrompt = `As a Trend Intelligence expert, create ${content_type} content for ${platform} that will trend ORGANICALLY (no paid ads).

Trend Topic: ${analysis.trend_topic}
Platform: ${platform}
Content Type: ${content_type}

Trend Analysis:
- Cultural Relevance Score: ${analysis.cultural_relevance_score}
- Novelty Score: ${analysis.novelty_score}
- Emotional Driver: ${analysis.emotional_driver}
- Lifecycle Stage: ${analysis.current_lifecycle_stage}
- Recommended Angle: ${analysis.recommended_angle}

Create content that:
1. Taps into cultural relevance (${analysis.cultural_relevance_score} score)
2. Has high visibility potential (organic sharing, not paid)
3. Shows novelty/differentiation
4. Creates emotional connection (${analysis.emotional_driver})
5. Aligns with current lifecycle stage
6. Can spread without commercial amplification

Format as JSON:
{
  "headline": "...",
  "content_text": "...",
  "hashtags": ["...", "..."],
  "visual_elements": ["..."],
  "posting_strategy": "...",
  "expected_engagement_score": 0.85,
  "cultural_relevance_score": 0.9,
  "novelty_score": 0.8,
  "emotional_connection_score": 0.85,
  "organic_potential_score": 0.9
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Trend Intelligence expert who creates organic trending content. You understand the 6 characteristics of trends and create content that will spread naturally without paid advertising.',
        },
        { role: 'user', content: contentPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(completion.choices[0].message.content || '{}');

    // Save content idea
    const contentId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO trending_content_ideas (id, trend_analysis_id, content_type, platform, headline, content_text, hashtags, visual_elements, posting_strategy, expected_engagement_score, cultural_relevance_score, novelty_score, emotional_connection_score, organic_potential_score, status, created_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, datetime('now'), datetime('now'))`,
      args: [
        contentId,
        trend_analysis_id,
        content_type,
        platform,
        content.headline || '',
        content.content_text || '',
        JSON.stringify(content.hashtags || []),
        JSON.stringify(content.visual_elements || []),
        content.posting_strategy || '',
        content.expected_engagement_score || 0,
        content.cultural_relevance_score || 0,
        content.novelty_score || 0,
        content.emotional_connection_score || 0,
        content.organic_potential_score || 0,
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Trending content generated - designed for organic trending without paid ads',
      content_id: contentId,
      platform,
      content_type,
      content: {
        headline: content.headline,
        content_text: content.content_text,
        hashtags: content.hashtags,
        visual_elements: content.visual_elements,
        posting_strategy: content.posting_strategy,
        organic_potential_score: content.organic_potential_score,
      },
      scores: {
        expected_engagement: content.expected_engagement_score,
        cultural_relevance: content.cultural_relevance_score,
        novelty: content.novelty_score,
        emotional_connection: content.emotional_connection_score,
        organic_potential: content.organic_potential_score,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to generate content', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

