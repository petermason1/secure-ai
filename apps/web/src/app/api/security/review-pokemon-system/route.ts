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
- Visual bot cards with stats and capabilities
- Rarity system based on effort scores
- Trading functionality between users
- Level/evolution mechanics
- Collectible system
- Battle/challenge mode`;

    const reviewPrompt = `You are the Security team reviewing a gamification system.

SYSTEM: ${systemDescription}

Provide a comprehensive security review covering:
1. Security Risks - Potential vulnerabilities or attack vectors
2. Data Privacy - What data is exposed, GDPR/compliance concerns
3. Access Control - Who can trade/modify bots, permission issues
4. Abuse Prevention - How to prevent gaming the system, cheating
5. Authentication - User verification for trading/actions
6. Recommendations - Security best practices to implement

Format as structured security analysis with priority levels.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a cybersecurity expert reviewing systems for security vulnerabilities, privacy concerns, and compliance issues.'
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
        'security',
        'security-reviewer',
        'security_review_completed',
        'security_review',
        reviewId,
        JSON.stringify({
          system: 'pokemon_card_bots',
          review_type: 'security_review',
          review,
          status: 'completed',
        }),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      department: 'Security',
      review,
      risks: extractRisks(review),
      recommendations: extractSecurityRecommendations(review),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

function extractRisks(review: string): string[] {
  const risks: string[] = [];
  const lines = review.split('\n');
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if ((lower.includes('risk') || lower.includes('vulnerability') || lower.includes('threat')) && 
        line.trim().length > 20) {
      risks.push(line.trim());
    }
  }

  return risks.slice(0, 10);
}

function extractSecurityRecommendations(review: string): string[] {
  const recommendations: string[] = [];
  const lines = review.split('\n');
  let inRecommendations = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('should')) {
      inRecommendations = true;
    }
    if (inRecommendations && (line.trim().startsWith('-') || line.trim().startsWith('•'))) {
      recommendations.push(line.trim().substring(1).trim());
    }
  }

  return recommendations.slice(0, 10);
}
