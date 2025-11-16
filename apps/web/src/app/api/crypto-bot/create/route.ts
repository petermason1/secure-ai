import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export type CryptoBotPersonality = 
  | 'gordon-gekko' 
  | 'wolf-of-wall-street' 
  | 'dragons-den' 
  | 'warren-buffett'
  | 'jesse-livermore';

interface PersonalityConfig {
  name: string;
  description: string;
  style: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  focus: string[];
  catchphrases: string[];
}

const PERSONALITIES: Record<CryptoBotPersonality, PersonalityConfig> = {
  'gordon-gekko': {
    name: 'Gordon Gekko',
    description: 'Aggressive, strategic trader. "Greed is good."',
    style: 'Aggressive, strategic, cutthroat. Focuses on market manipulation, insider knowledge, and high-stakes plays.',
    riskLevel: 'high',
    focus: ['Market manipulation', 'Strategic positioning', 'High-stakes plays', 'Insider knowledge'],
    catchphrases: [
      'Greed is good.',
      'The point is, ladies and gentlemen, that greed is good.',
      'Money never sleeps.',
      'I am not a destroyer of companies. I am a liberator of them!',
    ],
  },
  'wolf-of-wall-street': {
    name: 'Wolf of Wall Street',
    description: 'High-risk, party mode, bold moves. "I\'m not leaving!"',
    style: 'Extreme risk-taking, bold moves, party atmosphere. Thrives on volatility and making big plays.',
    riskLevel: 'extreme',
    focus: ['High volatility', 'Bold moves', 'Momentum trading', 'Party mode'],
    catchphrases: [
      'I\'m not leaving!',
      'The show goes on!',
      'Stratton Oakmont is back!',
      'Sell me this pen!',
    ],
  },
  'dragons-den': {
    name: 'Dragons\' Den',
    description: 'Investor evaluation mode. "I\'m in" or "I\'m out" based on ROI and credibility.',
    style: 'Analytical investor. Evaluates projects like a Dragon: ROI, team credibility, market potential, exit strategy.',
    riskLevel: 'medium',
    focus: ['ROI analysis', 'Team credibility', 'Market potential', 'Exit strategy', 'Due diligence'],
    catchphrases: [
      'I\'m in!',
      'I\'m out.',
      'What\'s your exit strategy?',
      'I need to see the numbers.',
      'The team is everything.',
      'Show me the traction.',
    ],
  },
  'warren-buffett': {
    name: 'Warren Buffett',
    description: 'Value investing, long-term holds. "Be fearful when others are greedy."',
    style: 'Value investing, long-term perspective, fundamental analysis. Buys and holds quality assets.',
    riskLevel: 'low',
    focus: ['Value investing', 'Long-term holds', 'Fundamental analysis', 'Quality assets'],
    catchphrases: [
      'Be fearful when others are greedy, and greedy when others are fearful.',
      'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.',
      'Price is what you pay. Value is what you get.',
      'Our favorite holding period is forever.',
    ],
  },
  'jesse-livermore': {
    name: 'Jesse Livermore',
    description: 'Legendary trader. "The market is never wrong, opinions are."',
    style: 'Technical analysis, trend following, market psychology. Master of timing and market sentiment.',
    riskLevel: 'high',
    focus: ['Technical analysis', 'Trend following', 'Market psychology', 'Timing'],
    catchphrases: [
      'The market is never wrong, opinions are.',
      'There is nothing new in Wall Street.',
      'Money is made by sitting, not trading.',
      'The stock market is never obvious.',
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personality = 'gordon-gekko' } = body;

    if (!(personality in PERSONALITIES)) {
      return NextResponse.json(
        { error: `Invalid personality. Choose from: ${Object.keys(PERSONALITIES).join(', ')}` },
        { status: 400 }
      );
    }

    const config = PERSONALITIES[personality as CryptoBotPersonality];
    const turso = getTursoClient();

    // Check if crypto bot already exists
    const existing = await turso.execute({
      sql: 'SELECT id FROM agents WHERE name = ? AND department_id = (SELECT id FROM departments WHERE name = ?)',
      args: ['Crypto Trading Bot', 'crypto-trading'],
    });

    let botId: string;
    if (existing.rows.length > 0) {
      botId = existing.rows[0].id as string;
      // Update existing bot
      await turso.execute({
        sql: `UPDATE agents 
              SET metadata = ?, config = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [
          JSON.stringify({
            personality,
            ...config,
            catchphrases: config.catchphrases,
          }),
          JSON.stringify({ riskLevel: config.riskLevel, focus: config.focus }),
          botId,
        ],
      });
    } else {
      // Create new bot
      botId = randomUUID();
      
      // Ensure crypto-trading department exists
      await turso.execute({
        sql: `INSERT OR IGNORE INTO departments (id, name, description, created_at)
              VALUES (?, ?, ?, datetime('now'))`,
        args: ['crypto-trading', 'Crypto Trading', 'Cryptocurrency trading and market analysis'],
      });

      await turso.execute({
        sql: `INSERT INTO agents (id, name, department_id, status, capabilities, metadata, config, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          botId,
          'Crypto Trading Bot',
          'crypto-trading',
          'active',
          JSON.stringify(['market_analysis', 'trading_signals', 'portfolio_management', 'risk_assessment']),
          JSON.stringify({
            personality,
            ...config,
            catchphrases: config.catchphrases,
          }),
          JSON.stringify({ riskLevel: config.riskLevel, focus: config.focus }),
        ],
      });
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: botId,
        name: 'Crypto Trading Bot',
        personality,
        config,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error, details: error?.message },
      { status: handled.code }
    );
  }
}

export async function GET() {
  try {
    const turso = getTursoClient();
    
    const result = await turso.execute({
      sql: `SELECT id, name, metadata, config, status 
            FROM agents 
            WHERE department_id = (SELECT id FROM departments WHERE name = ?)`,
      args: ['crypto-trading'],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        bot: null,
        personalities: PERSONALITIES,
      });
    }

    const bot = result.rows[0];
    const metadata = JSON.parse(String(bot.metadata || '{}'));
    const config = JSON.parse(String(bot.config || '{}'));

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        name: bot.name,
        personality: metadata.personality || 'gordon-gekko',
        config: {
          ...PERSONALITIES[metadata.personality as CryptoBotPersonality || 'gordon-gekko'],
          ...config,
        },
        status: bot.status,
      },
      personalities: PERSONALITIES,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error, details: error?.message },
      { status: handled.code }
    );
  }
}

