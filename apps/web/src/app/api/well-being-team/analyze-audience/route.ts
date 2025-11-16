import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personality, audienceData, platform } = body;

    if (!personality) {
      return NextResponse.json(
        { error: 'personality is required' },
        { status: 400 }
      );
    }

    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    // Get personality config
    const botResult = await turso.execute({
      sql: `SELECT metadata, config FROM agents 
            WHERE name = ? AND department_id = ?
            LIMIT 1`,
      args: [personality, 'well-being-team'],
    });

    let personalityConfig: any = {};
    let monetizationStrategy: string[] = [];
    
    if (botResult.rows.length > 0) {
      personalityConfig = JSON.parse(String(botResult.rows[0].metadata || '{}'));
      const config = JSON.parse(String(botResult.rows[0].config || '{}'));
      monetizationStrategy = config.monetizationStrategy || [];
    }

    const systemPrompt = `You are ${personalityConfig.name || personality}, a world-renowned motivational speaker and coach with expertise in audience analysis and monetization.

Your monetization strategies: ${monetizationStrategy.join(', ') || 'Premium coaching, courses, events'}

Analyze the provided audience data and provide:
1. Audience demographics and psychographics
2. Spending capacity and willingness to invest
3. Pain points and desires
4. Best content formats for engagement
5. Monetization opportunities specific to this audience
6. Platform-specific strategies (if platform provided)
7. Recommended pricing tiers
8. Content themes that will resonate

Be specific, actionable, and focused on high-value monetization opportunities.`;

    const userPrompt = `Analyze this audience data for ${personalityConfig.name || personality}:

${audienceData ? JSON.stringify(audienceData, null, 2) : 'No specific audience data provided - analyze the general target audience for this personality.'}

${platform ? `Platform: ${platform}` : ''}

Provide a comprehensive audience analysis with monetization recommendations.`;

    const analysis = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const analysisContent = analysis.choices[0]?.message?.content || 'Analysis failed.';

    // Store in database
    const analysisId = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
            VALUES (?, (SELECT id FROM agents WHERE name = ? AND department_id = ? LIMIT 1), ?, ?, datetime('now'))`,
      args: [
        analysisId,
        personalityConfig.name || personality,
        'well-being-team',
        'audience_analysis',
        JSON.stringify({
          audienceData,
          platform,
          analysis: analysisContent,
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      analysis: analysisContent,
      personality: personalityConfig.name || personality,
      platform,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error, details: error?.message },
      { status: handled.code }
    );
  }
}

