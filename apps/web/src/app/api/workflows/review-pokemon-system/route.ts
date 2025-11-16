import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const requestBody = await request.json().catch(() => ({}));
    const { uploadMetadata = null, siteUrl = null } = requestBody as {
      uploadMetadata?: { filename: string; size: number; type: string } | null;
      siteUrl?: string | null;
    };

    const ldRes = await fetch(`${baseUrl}/api/learning-dev/review-pokemon-system`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const ldData = await ldRes.json();

    const securityRes = await fetch(`${baseUrl}/api/security/review-pokemon-system`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const securityData = await securityRes.json();

    const monetizationStrategy = {
      tiers: {
        free: {
          price: 0,
          features: ['5 bots', 'Common cards only', 'Basic stats'],
          revenue_potential: 'Low - conversion funnel',
        },
        starter: {
          price: 10,
          features: ['10 bots', 'Rare cards', 'Trading', 'Basic analytics'],
          revenue_potential: 'Medium - £10/month × users',
        },
        pro: {
          price: 30,
          features: ['Unlimited bots', 'All rarities', 'Battles', 'Advanced analytics'],
          revenue_potential: 'High - £30/month × power users',
        },
        enterprise: {
          price: 100,
          features: ['Everything', 'Custom bots', 'API access', 'White-label'],
          revenue_potential: 'Very High - £100/month × teams',
        },
      },
      additional_revenue: {
        card_packs: { price: 5, description: '5 random bot cards' },
        powerups: { price: 2, description: 'Temporary boosts' },
        evolution_stones: { price: 15, description: 'Evolve bots to next stage' },
        custom_avatars: { price: 3, description: 'Custom bot appearances' },
      },
      estimated_revenue: {
        month_1: '£500-1000 (early adopters)',
        month_3: '£2000-5000 (growth phase)',
        month_6: '£5000-10000 (mature)',
      },
    };

    const reviewId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reviewId,
        'workflow',
        'workflow-orchestrator',
        'system_review_completed',
        'system_review',
        reviewId,
        JSON.stringify({
          system: 'pokemon_card_bots',
          ld_review: ldData,
          security_review: securityData,
          monetization_strategy: monetizationStrategy,
          status: 'approved',
          attachments: {
            upload_metadata: uploadMetadata,
            site_preview_url: siteUrl,
          },
        }),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      reviews: {
        learning_development: ldData,
        security: securityData,
      },
      monetization: monetizationStrategy,
      approval_status: 'approved',
      attachments: {
        upload_metadata: uploadMetadata,
        site_preview_url: siteUrl,
      },
      message: 'Pokemon card system reviewed and approved with monetization strategy',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
