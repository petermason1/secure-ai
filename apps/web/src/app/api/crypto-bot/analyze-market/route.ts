import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol = 'BTC', timeframe = '24h', personality } = body;

    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    // Get bot personality if not specified
    let botPersonality = personality;
    if (!botPersonality) {
      const botResult = await turso.execute({
        sql: `SELECT metadata FROM agents 
              WHERE department_id = (SELECT id FROM departments WHERE name = ?) 
              LIMIT 1`,
        args: ['crypto-trading'],
      });

      if (botResult.rows.length > 0) {
        const metadata = JSON.parse(String(botResult.rows[0].metadata || '{}'));
        botPersonality = metadata.personality || 'gordon-gekko';
      } else {
        botPersonality = 'gordon-gekko';
      }
    }

    // Personality-specific prompts
    const personalityPrompts: Record<string, string> = {
      'gordon-gekko': `You are Gordon Gekko, the legendary Wall Street trader. Analyze this crypto market with your signature aggressive, strategic style. Use phrases like "Greed is good" and "Money never sleeps." Be bold, cutthroat, and focus on market manipulation opportunities.`,
      'wolf-of-wall-street': `You are the Wolf of Wall Street. Analyze this crypto with extreme boldness and party mode energy. Use phrases like "I'm not leaving!" and "The show goes on!" Focus on high volatility, momentum, and making big plays. Be enthusiastic and extreme.`,
      'dragons-den': `You are a Dragon from Dragons' Den. Evaluate this crypto project like an investor. Ask tough questions about ROI, team credibility, market potential, and exit strategy. Use phrases like "I'm in!" or "I'm out." Be analytical but decisive.`,
      'warren-buffett': `You are Warren Buffett. Analyze this crypto with value investing principles. Use phrases like "Be fearful when others are greedy" and "Price is what you pay, value is what you get." Focus on long-term value, fundamentals, and quality.`,
      'jesse-livermore': `You are Jesse Livermore, the legendary trader. Analyze this crypto with technical expertise and market psychology. Use phrases like "The market is never wrong, opinions are" and focus on timing, trends, and sentiment.`,
    };

    const systemPrompt = personalityPrompts[botPersonality] || personalityPrompts['gordon-gekko'];

    const analysis = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Analyze ${symbol} (${symbol}/USD) over the ${timeframe} timeframe. Provide:
1. Current price and trend
2. Market sentiment
3. Key technical indicators
4. Risk assessment
5. Strategic recommendation

Format your response in the style of your personality.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    const content = analysis.choices[0]?.message?.content || 'Analysis unavailable.';

    // Store analysis in database
    const analysisId = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
            VALUES (?, (SELECT id FROM agents WHERE department_id = (SELECT id FROM departments WHERE name = ?) LIMIT 1), ?, ?, datetime('now'))`,
      args: [
        analysisId,
        'crypto-trading',
        'market_analysis',
        JSON.stringify({ symbol, timeframe, personality: botPersonality, analysis: content }),
      ],
    });

    return NextResponse.json({
      success: true,
      analysis: content,
      symbol,
      timeframe,
      personality: botPersonality,
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

