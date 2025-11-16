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
    const { url, site_structure, robots_txt, sitemap_url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'url is required' },
        { status: 400 }
      );
    }

    // Use AI to perform technical SEO audit
    const auditPrompt = `As a Technical SEO Bot, perform a technical SEO audit for: ${url}

Available information:
${site_structure ? `Site structure: ${site_structure}` : ''}
${robots_txt ? `Robots.txt: ${robots_txt}` : ''}
${sitemap_url ? `Sitemap: ${sitemap_url}` : ''}

Analyze and provide:
1. Technical SEO Score (0-100)
2. Issues found (array of issues with severity: critical, high, medium, low)
3. Recommendations (array of actionable recommendations)
4. Schema markup opportunities
5. Mobile optimization status
6. Site speed concerns

Format as JSON:
{
  "technical_seo_score": 80,
  "issues": [
    {"issue": "Missing sitemap", "severity": "high"},
    {"issue": "No schema markup", "severity": "medium"}
  ],
  "recommendations": ["Add XML sitemap", "Implement schema.org markup"],
  "schema_opportunities": ["Article", "Organization"],
  "mobile_optimized": true,
  "speed_concerns": ["Large images", "Unminified CSS"]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert technical SEO auditor. Return only valid JSON.' },
        { role: 'user', content: auditPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const audit = JSON.parse(completion.choices[0].message.content || '{}');

    // Get Technical SEO Bot agent ID
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Technical SEO%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Create SEO task for this audit
    const taskId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO seo_tasks (id, task_type, title, description, status, priority, assigned_agent_id, target_url, result, completed_at, created_at, updated_at)
            VALUES (?, 'technical_audit', 'Technical SEO Audit', ?, 'completed', 'high', ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
      args: [
        taskId,
        `Technical audit for ${url}`,
        agentId,
        url,
        JSON.stringify(audit),
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Technical SEO audit completed',
      url,
      audit: {
        technical_seo_score: audit.technical_seo_score,
        issues: audit.issues,
        recommendations: audit.recommendations,
        schema_opportunities: audit.schema_opportunities,
        mobile_optimized: audit.mobile_optimized,
      },
      task_id: taskId,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to perform technical audit', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

