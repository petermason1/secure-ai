import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get all recommendations
    const recommendationsResult = await turso.execute({
      sql: `SELECT * FROM recruitment_recommendations 
            WHERE status IN ('recommended', 'approved', 'hiring')
            ORDER BY priority_score DESC, urgency DESC`,
    });

    const recommendations = recommendationsResult.rows.map((row: any) => ({
      id: row.id,
      role_title: row.role_title,
      role_type: row.role_type,
      urgency: row.urgency,
      priority_score: row.priority_score,
      cost_estimate_min: row.cost_estimate_min,
      cost_estimate_max: row.cost_estimate_max,
      revenue_impact: row.revenue_impact,
      timeline_weeks: row.timeline_weeks,
      impact_forecast: row.impact_forecast,
      status: row.status,
    }));

    // Calculate summary
    const totalCostMin = recommendations.reduce((sum: number, r: any) => sum + (r.cost_estimate_min || 0), 0);
    const totalCostMax = recommendations.reduce((sum: number, r: any) => sum + (r.cost_estimate_max || 0), 0);
    const totalRevenueImpact = recommendations.reduce((sum: number, r: any) => sum + (r.revenue_impact || 0), 0);

    // Group by urgency
    const byUrgency = {
      critical: recommendations.filter((r: any) => r.urgency === 'critical'),
      high: recommendations.filter((r: any) => r.urgency === 'high'),
      medium: recommendations.filter((r: any) => r.urgency === 'medium'),
      low: recommendations.filter((r: any) => r.urgency === 'low'),
    };

    // Group by role type
    const byType = {
      full_time: recommendations.filter((r: any) => r.role_type === 'full_time'),
      fractional: recommendations.filter((r: any) => r.role_type === 'fractional'),
      contractor: recommendations.filter((r: any) => r.role_type === 'contractor'),
      consultant: recommendations.filter((r: any) => r.role_type === 'consultant'),
      freelance: recommendations.filter((r: any) => r.role_type === 'freelance'),
    };

    return NextResponse.json({
      success: true,
      report: {
        summary: {
          total_recommendations: recommendations.length,
          total_cost_min: totalCostMin,
          total_cost_max: totalCostMax,
          total_revenue_impact: totalRevenueImpact,
          roi_estimate: totalRevenueImpact > 0 ? ((totalRevenueImpact - totalCostMax) / totalCostMax * 100).toFixed(1) : 0,
        },
        by_urgency: byUrgency,
        by_type: byType,
        recommendations,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

