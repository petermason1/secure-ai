import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status') || 'recommended';

    let sql = `SELECT * FROM recruitment_recommendations WHERE status = ?`;
    const args: any[] = [status];

    if (urgency) {
      sql += ` AND urgency = ?`;
      args.push(urgency);
    }

    sql += ` ORDER BY priority_score DESC, created_at DESC`;

    const result = await turso.execute({ sql, args });

    const recommendations = result.rows.map((row: any) => ({
      id: row.id,
      role_title: row.role_title,
      role_type: row.role_type,
      urgency: row.urgency,
      priority_score: row.priority_score,
      skill_gaps: JSON.parse(String(row.skill_gaps || '[]')),
      required_skills: JSON.parse(String(row.required_skills || '[]')),
      recommended_skills: JSON.parse(String(row.recommended_skills || '[]')),
      cost_estimate_min: row.cost_estimate_min,
      cost_estimate_max: row.cost_estimate_max,
      cost_currency: row.cost_currency,
      impact_forecast: row.impact_forecast,
      revenue_impact: row.revenue_impact,
      timeline_weeks: row.timeline_weeks,
      status: row.status,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

