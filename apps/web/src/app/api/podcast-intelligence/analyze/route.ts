import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { episode_id } = body;

    if (!episode_id) {
      return NextResponse.json(
        { error: 'episode_id is required' },
        { status: 400 }
      );
    }

    // Get episode and transcript
    const episodeResult = await turso.execute({
      sql: `SELECT e.*, t.transcript_text, t.id as transcript_id
            FROM podcast_episodes e
            LEFT JOIN podcast_transcripts t ON e.id = t.episode_id
            WHERE e.id = ?`,
      args: [episode_id],
    });

    if (episodeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    const episode = episodeResult.rows[0];
    const transcriptValue = episode.transcript_text;
    const transcriptText =
      typeof transcriptValue === 'string'
        ? transcriptValue
        : transcriptValue != null
        ? String(transcriptValue)
        : '';

    if (!transcriptText) {
      return NextResponse.json(
        { error: 'No transcript found for this episode. Please transcribe first.' },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the transcript
    const analysisPrompt = `Analyze this podcast transcript and extract:

1. KEY TRENDS (3-5 emerging trends mentioned)
2. EXPERT OPINIONS (notable quotes and viewpoints from the guest)
3. BUSINESS IDEAS (potential business opportunities mentioned)
4. KEY TAKEAWAYS (main insights and lessons)
5. TECHNOLOGIES (technologies, tools, or platforms discussed)
6. MARKET OPPORTUNITIES (market gaps or opportunities identified)

Format as JSON with this structure:
{
  "trends": [{"name": "...", "description": "...", "category": "..."}],
  "expert_opinions": [{"expert": "...", "topic": "...", "opinion": "...", "sentiment": "..."}],
  "business_ideas": [{"title": "...", "description": "...", "market_category": "..."}],
  "key_takeaways": ["...", "..."],
  "technologies": ["...", "..."],
  "market_opportunities": ["...", "..."]
}

Transcript:
${transcriptText.substring(0, 15000)}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert podcast analyst specializing in extracting business insights, trends, and expert opinions from podcast transcripts.' },
        { role: 'user', content: analysisPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Get agent ID for this podcast
    const agentResult = await turso.execute({
      sql: `SELECT a.id FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE d.name LIKE '%podcast%' OR d.name LIKE '%intelligence%'
            LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Save insights to database
    const insights = [];

    // Save trends
    if (analysis.trends) {
      for (const trend of analysis.trends) {
        const trendId = randomUUID();
        await turso.execute({
          sql: `INSERT INTO podcast_trends (id, trend_name, description, category, first_mentioned_date, mention_count, extracted_by_agent_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), 1, ?, datetime('now'), datetime('now'))`,
          args: [trendId, trend.name, trend.description, trend.category || 'other', agentId],
        });
        insights.push({ type: 'trend', id: trendId, ...trend });
      }
    }

    // Save expert opinions
    if (analysis.expert_opinions) {
      for (const opinion of analysis.expert_opinions) {
        const opinionId = randomUUID();
        await turso.execute({
          sql: `INSERT INTO podcast_expert_opinions (id, episode_id, expert_name, topic, opinion_text, sentiment, extracted_by_agent_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          args: [opinionId, episode_id, opinion.expert || episode.guest_name || 'Unknown', opinion.topic, opinion.opinion, opinion.sentiment || 'neutral', agentId],
        });
        insights.push({ type: 'expert_opinion', id: opinionId, ...opinion });
      }
    }

    // Save business ideas
    if (analysis.business_ideas) {
      for (const idea of analysis.business_ideas) {
        const ideaId = randomUUID();
        await turso.execute({
          sql: `INSERT INTO podcast_business_ideas (id, episode_id, idea_title, idea_description, market_category, extracted_by_agent_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          args: [ideaId, episode_id, idea.title, idea.description, idea.market_category || null, agentId],
        });
        insights.push({ type: 'business_idea', id: ideaId, ...idea });
      }
    }

    // Save key takeaways as insights
    if (analysis.key_takeaways) {
      for (const takeaway of analysis.key_takeaways) {
        const insightId = randomUUID();
        await turso.execute({
          sql: `INSERT INTO podcast_insights (id, episode_id, insight_type, title, content, confidence_score, extracted_by_agent_id, created_at, updated_at)
                VALUES (?, ?, 'key_takeaway', ?, ?, 0.8, ?, datetime('now'), datetime('now'))`,
          args: [insightId, episode_id, takeaway.substring(0, 100), takeaway, agentId],
        });
        insights.push({ type: 'key_takeaway', id: insightId, title: takeaway.substring(0, 100), content: takeaway });
      }
    }

    // Update episode status
    await turso.execute({
      sql: `UPDATE podcast_episodes SET status = 'analyzed', updated_at = datetime('now') WHERE id = ?`,
      args: [episode_id],
    });

    return NextResponse.json({
      success: true,
      message: 'Episode analyzed successfully',
      episode_id,
      insights_count: insights.length,
      insights: {
        trends: analysis.trends?.length || 0,
        expert_opinions: analysis.expert_opinions?.length || 0,
        business_ideas: analysis.business_ideas?.length || 0,
        key_takeaways: analysis.key_takeaways?.length || 0,
      },
      analysis,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to analyze episode', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

