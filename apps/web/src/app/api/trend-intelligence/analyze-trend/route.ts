import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a trend using the 6 key characteristics:
 * 1. Cultural relevance
 * 2. Visibility and rapid adoption
 * 3. Novelty and differentiation
 * 4. Emotional connection
 * 5. Lifecycle stage
 * 6. Economic/market influence
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { trend_topic, platform = 'all' } = body;

    if (!trend_topic) {
      return NextResponse.json(
        { error: 'trend_topic is required' },
        { status: 400 }
      );
    }

    // Get Trend Intelligence Bot
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Trend Intelligence%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Use AI to analyze the trend based on the 6 characteristics
    const analysisPrompt = `As a Trend Intelligence expert, analyze this trend: "${trend_topic}"

Analyze using these 6 key characteristics of trending items:

1. CULTURAL RELEVANCE (0-1 score):
   - Does it resonate with current values, attitudes, aspirations?
   - Is it aligned with the zeitgeist?
   - What cultural narrative does it tap into?

2. VISIBILITY & RAPID ADOPTION (0-1 score):
   - How visible is it across channels?
   - What's the adoption rate?
   - Which channels are amplifying it? (celebrity, media, social platforms)

3. NOVELTY & DIFFERENTIATION (0-1 score):
   - What's novel about it?
   - How does it differentiate from existing trends?
   - What innovation does it represent?

4. EMOTIONAL CONNECTION (identify driver):
   - What emotional driver? (status, nostalgia, rebellion, belonging, aspiration, fear, joy)
   - How does it make people feel part of something bigger?

5. LIFECYCLE STAGE:
   - Current stage: introduction, rapid_rise, mass_adoption, oversaturation, decline, reinvention
   - Predict peak date
   - Predict decline date

6. ECONOMIC/MARKET INFLUENCE:
   - Is commercial interest amplifying it?
   - Organic vs paid ratio estimate
   - Market saturation level

Provide analysis as JSON:
{
  "cultural_relevance_score": 0.85,
  "cultural_context": "...",
  "visibility_score": 0.75,
  "adoption_rate": 0.6,
  "visibility_channels": ["twitter", "tiktok"],
  "novelty_score": 0.8,
  "differentiation": "...",
  "emotional_driver": "belonging",
  "emotional_connection_description": "...",
  "current_lifecycle_stage": "rapid_rise",
  "predicted_peak_date": "2024-03-15",
  "predicted_decline_date": "2024-06-01",
  "competitor_content_count": 150,
  "opportunity_score": 0.7,
  "organic_vs_paid_ratio": 0.8,
  "recommended_angle": "...",
  "content_suggestions": ["...", "..."]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Trend Intelligence expert who understands the 6 key characteristics of trending items throughout history. You analyze trends to create organic content that will trend without paid advertising.',
        },
        { role: 'user', content: analysisPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Save analysis
    const analysisId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO trend_analysis (id, trend_topic, platform, current_lifecycle_stage, cultural_relevance_score, novelty_score, emotional_driver, visibility_score, adoption_rate, predicted_peak_date, predicted_decline_date, competitor_content_count, opportunity_score, recommended_angle, content_suggestions, analyzed_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        analysisId,
        trend_topic,
        platform,
        analysis.current_lifecycle_stage || 'introduction',
        analysis.cultural_relevance_score || 0,
        analysis.novelty_score || 0,
        analysis.emotional_driver || 'belonging',
        analysis.visibility_score || 0,
        analysis.adoption_rate || 0,
        analysis.predicted_peak_date || null,
        analysis.predicted_decline_date || null,
        analysis.competitor_content_count || 0,
        analysis.opportunity_score || 0,
        analysis.recommended_angle || '',
        JSON.stringify(analysis.content_suggestions || []),
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Trend analyzed successfully',
      analysis_id: analysisId,
      trend_topic,
      platform,
      analysis: {
        cultural_relevance_score: analysis.cultural_relevance_score,
        visibility_score: analysis.visibility_score,
        novelty_score: analysis.novelty_score,
        emotional_driver: analysis.emotional_driver,
        current_lifecycle_stage: analysis.current_lifecycle_stage,
        opportunity_score: analysis.opportunity_score,
        recommended_angle: analysis.recommended_angle,
        content_suggestions: analysis.content_suggestions,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to analyze trend', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

