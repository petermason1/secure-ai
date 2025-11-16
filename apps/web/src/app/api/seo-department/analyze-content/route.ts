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
    const { url, title, content, meta_description } = body;

    if (!url || !content) {
      return NextResponse.json(
        { error: 'url and content are required' },
        { status: 400 }
      );
    }

    // Analyze content with AI
    const analysisPrompt = `As a Content SEO Bot, analyze this webpage for SEO optimization:

URL: ${url}
Title: ${title || 'Not provided'}
Meta Description: ${meta_description || 'Not provided'}
Content: ${content.substring(0, 5000)}

Provide SEO analysis including:
1. SEO Score (0-100)
2. Word count
3. Keyword density estimate
4. Readability score (0-100)
5. Recommendations for improvement (array of strings)
6. Missing elements (title, meta description, headings, etc.)

Format as JSON:
{
  "seo_score": 75,
  "word_count": 500,
  "keyword_density": 2.5,
  "readability_score": 65,
  "recommendations": ["Add meta description", "Include more internal links"],
  "missing_elements": ["h1 tag", "meta description"]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert SEO content analyst. Return only valid JSON.' },
        { role: 'user', content: analysisPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Get Content SEO Bot agent ID
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Content SEO%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Check if analysis exists
    const existingResult = await turso.execute({
      sql: `SELECT id FROM seo_content_optimization WHERE url = ?`,
      args: [url],
    });

    const optimizationId = existingResult.rows[0]?.id || randomUUID();

    if (existingResult.rows.length > 0) {
      await turso.execute({
        sql: `UPDATE seo_content_optimization 
              SET title = ?, meta_description = ?, word_count = ?, seo_score = ?, recommendations = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [
          title || null,
          meta_description || null,
          analysis.word_count || 0,
          analysis.seo_score || 0,
          JSON.stringify(analysis.recommendations || []),
          optimizationId,
        ],
      });
    } else {
      await turso.execute({
        sql: `INSERT INTO seo_content_optimization (id, url, title, meta_description, word_count, seo_score, recommendations, analyzed_by_agent_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          optimizationId,
          url,
          title || null,
          meta_description || null,
          analysis.word_count || 0,
          analysis.seo_score || 0,
          JSON.stringify(analysis.recommendations || []),
          agentId,
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Content analyzed successfully',
      url,
      analysis: {
        seo_score: analysis.seo_score,
        word_count: analysis.word_count,
        recommendations: analysis.recommendations,
        missing_elements: analysis.missing_elements,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to analyze content', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

