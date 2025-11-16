import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { action, user_id, tier, purchase_type } = body;

    if (action === 'check_limits') {
      const userTier = tier || 'free';
      
      const limits = {
        free: {
          max_bots: 5,
          max_rarity: 'rare',
          trading_enabled: false,
          battles_enabled: false,
          custom_bots: false,
        },
        starter: {
          max_bots: 10,
          max_rarity: 'rare',
          trading_enabled: true,
          battles_enabled: false,
          custom_bots: false,
        },
        pro: {
          max_bots: -1,
          max_rarity: 'legendary',
          trading_enabled: true,
          battles_enabled: true,
          custom_bots: false,
        },
        enterprise: {
          max_bots: -1,
          max_rarity: 'legendary',
          trading_enabled: true,
          battles_enabled: true,
          custom_bots: true,
          api_access: true,
          white_label: true,
        },
      };

      return NextResponse.json({
        success: true,
        tier: userTier,
        limits: limits[userTier as keyof typeof limits],
        pricing: {
          free: { monthly: 0, features: ['5 bots', 'Common cards only'] },
          starter: { monthly: 10, features: ['10 bots', 'Rare cards', 'Trading'] },
          pro: { monthly: 30, features: ['Unlimited bots', 'All rarities', 'Battles', 'Trading'] },
          enterprise: { monthly: 100, features: ['Everything', 'Custom bots', 'API', 'White-label'] },
        },
      });
    }

    if (action === 'purchase_card_pack') {
      const packId = randomUUID();
      const cards = generateCardPack();

      await turso.execute({
        sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          packId,
          'monetization',
          user_id || 'user',
          'card_pack_purchased',
          'card_pack',
          packId,
          JSON.stringify({
            purchase_type: 'card_pack',
            price: 5,
            cards: cards,
            user_id,
          }),
          new Date().toISOString(),
        ],
      });

      return NextResponse.json({
        success: true,
        pack_id: packId,
        cards,
        price: 5,
        message: 'Card pack purchased!',
      });
    }

    if (action === 'purchase_powerup') {
      const { bot_id, powerup_type, duration_hours } = body;
      const prices: Record<string, number> = {
        effort_boost: 2,
        priority_boost: 3,
        focus_boost: 2,
        evolution_stone: 15,
      };

      const price = prices[powerup_type] || 5;

      const purchaseId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          purchaseId,
          'monetization',
          user_id || 'user',
          'powerup_purchased',
          'powerup',
          purchaseId,
          JSON.stringify({
            purchase_type: 'powerup',
            powerup_type,
            bot_id,
            duration_hours,
            price,
            user_id,
          }),
          new Date().toISOString(),
        ],
      });

      return NextResponse.json({
        success: true,
        purchase_id: purchaseId,
        powerup_type,
        price,
        message: `Power-up purchased for £${price}`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

function generateCardPack(): Array<{ name: string; rarity: string; level: number }> {
  const cards = [];
  const rarities = ['common', 'common', 'common', 'rare', 'epic', 'legendary'];
  const weights = [40, 40, 40, 15, 4, 1];

  for (let i = 0; i < 5; i++) {
    const rand = Math.random() * 100;
    let rarity = 'common';
    let cumulative = 0;
    
    for (let j = 0; j < rarities.length; j++) {
      cumulative += weights[j];
      if (rand <= cumulative) {
        rarity = rarities[j];
        break;
      }
    }

    cards.push({
      name: `Bot ${Math.floor(Math.random() * 1000)}`,
      rarity,
      level: Math.floor(Math.random() * 20) + 1,
    });
  }

  return cards;
}
