import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { topic, target_audience, intent } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'topic is required' },
        { status: 400 }
      );
    }

    // Use AI to generate keyword research
    const prompt = `As a Content SEO Bot, research keywords for the topic: "${topic}"
${target_audience ? `Target audience: ${target_audience}` : ''}
${intent ? `Intent: ${intent}` : ''}

Generate 10-15 relevant keywords with:
- Keyword phrase
- Estimated search volume (0-100 scale)
- Difficulty score (0-100, where 0 is easy)
- Intent type (informational, navigational, transactional, commercial)
- Category

Format as JSON array:
[
  {
    "keyword": "...",
    "search_volume": 50,
    "difficulty": 30,
    "intent": "informational",
    "category": "..."
  }
]`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert SEO keyword researcher. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const keywords = response.keywords || [];

    // Get Content SEO Bot agent ID
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Content SEO%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Save keywords to database
    const savedKeywords = [];
    for (const kw of keywords) {
      const keywordId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO seo_keywords (id, keyword, search_volume, difficulty_score, intent, category, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 'tracking', datetime('now'), datetime('now'))`,
        args: [
          keywordId,
          kw.keyword,
          kw.search_volume || 0,
          kw.difficulty || 0,
          kw.intent || 'informational',
          kw.category || 'general',
        ],
      });
      savedKeywords.push({ id: keywordId, ...kw });
    }

    return NextResponse.json({
      success: true,
      message: `Found ${savedKeywords.length} keywords`,
      keywords: savedKeywords,
      topic,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to research keywords', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

