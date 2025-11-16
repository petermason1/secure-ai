import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const systemDescription = `Pokemon Card-Style Bot Profile System:
- Visual bot cards with stats (Power, Urgency, Accuracy, Stamina)
- Rarity system (Common, Rare, Epic, Legendary) based on effort scores
- Special Moves (capabilities as powers)
- Level system based on effort metrics
- Evolution stages
- Collectible mechanics
- Trading functionality
- Battle/challenge mode potential`;

    const reviewPrompt = `You are the Learning & Development team reviewing a gamification system.

SYSTEM: ${systemDescription}

Provide a comprehensive review covering:
1. Educational Value - Does this help users learn bot capabilities?
2. Engagement Potential - Will this increase user interaction?
3. Learning Outcomes - What skills/knowledge will users gain?
4. Training Effectiveness - Will this improve bot management skills?
5. Recommendations - How to enhance learning aspects
6. Potential Issues - Any concerns from L&D perspective

Format as structured analysis with actionable recommendations.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a learning & development specialist evaluating gamification systems for educational value and engagement.'
        },
        {
          role: 'user',
          content: reviewPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const review = completion.choices[0]?.message?.content || '';

    const reviewId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reviewId,
        'learning-dev-team',
        'ld-reviewer',
        'system_reviewed',
        'system_review',
        reviewId,
        JSON.stringify({
          system: 'pokemon_card_bots',
          review_type: 'ld_review',
          review,
          status: 'completed',
        }),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      department: 'Learning & Development',
      review,
      recommendations: extractRecommendations(review),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

function extractRecommendations(review: string): string[] {
  const recommendations: string[] = [];
  const lines = review.split('\n');
  let inRecommendations = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('suggestion')) {
      inRecommendations = true;
    }
    if (inRecommendations && line.trim().startsWith('-')) {
      recommendations.push(line.trim().substring(1).trim());
    }
  }

  return recommendations.slice(0, 10);
}
