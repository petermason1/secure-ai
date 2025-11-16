import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol = 'BTC', action, personality } = body;

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

    // Personality-specific trading signal prompts
    const signalPrompts: Record<string, string> = {
      'gordon-gekko': `You are Gordon Gekko. Generate a trading signal for ${symbol}. Be aggressive and strategic. Use your catchphrases. Provide: signal (BUY/SELL/HOLD), entry price, stop loss, take profit, confidence (1-10), and a bold strategic plan.`,
      'wolf-of-wall-street': `You are the Wolf of Wall Street. Generate an extreme trading signal for ${symbol}. Be bold and enthusiastic. Use your catchphrases. Provide: signal (BUY/SELL/HOLD), entry price, stop loss, take profit, confidence (1-10), and an aggressive trading plan.`,
      'dragons-den': `You are a Dragon from Dragons' Den. Evaluate ${symbol} as an investment opportunity. Decide: "I'm in" (BUY), "I'm out" (SELL), or "Maybe" (HOLD). Provide: decision, entry price, ROI projection, risk assessment, exit strategy, and confidence (1-10).`,
      'warren-buffett': `You are Warren Buffett. Evaluate ${symbol} as a value investment. Use your value investing principles. Provide: signal (BUY/SELL/HOLD), entry price, long-term value assessment, fundamentals analysis, and confidence (1-10).`,
      'jesse-livermore': `You are Jesse Livermore. Generate a trading signal for ${symbol} based on technical analysis and market psychology. Provide: signal (BUY/SELL/HOLD), entry price, stop loss, take profit, timing analysis, and confidence (1-10).`,
    };

    const systemPrompt = signalPrompts[botPersonality] || signalPrompts['gordon-gekko'];

    const signal = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: action 
            ? `Generate a trading signal for ${symbol} with action: ${action}`
            : `Generate a trading signal for ${symbol} based on current market conditions.`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const content = signal.choices[0]?.message?.content || 'Signal unavailable.';

    // Parse signal (try to extract structured data)
    const signalMatch = content.match(/(BUY|SELL|HOLD)/i);
    const signalType = signalMatch ? signalMatch[1].toUpperCase() : 'HOLD';

    // Store signal in database
    const signalId = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
            VALUES (?, (SELECT id FROM agents WHERE department_id = (SELECT id FROM departments WHERE name = ?) LIMIT 1), ?, ?, datetime('now'))`,
      args: [
        signalId,
        'crypto-trading',
        'trading_signal',
        JSON.stringify({ 
          symbol, 
          signal: signalType, 
          personality: botPersonality, 
          analysis: content,
          action,
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      signal: signalType,
      analysis: content,
      symbol,
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

