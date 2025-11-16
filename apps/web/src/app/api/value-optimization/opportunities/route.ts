import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM value_opportunities WHERE 1=1`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    if (priority) {
      sql += ` AND priority = ?`;
      args.push(priority);
    }

    sql += ` ORDER BY estimated_value_impact DESC, priority DESC, created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const opportunities = result.rows.map((row: any) => ({
      id: row.id,
      opportunity_type: row.opportunity_type,
      title: row.title,
      description: row.description,
      current_state: row.current_state,
      target_state: row.target_state,
      estimated_value_impact: row.estimated_value_impact,
      confidence_score: row.confidence_score,
      effort_level: row.effort_level,
      time_to_complete_days: row.time_to_complete_days,
      priority: row.priority,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    // Calculate totals
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value_impact || 0), 0);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      total_potential_value: totalValue,
      opportunities,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get opportunities' },
      { status: handled.code || 500 }
    );
  }
}

