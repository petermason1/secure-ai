import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '20');

    let sql = `SELECT * FROM security_alerts WHERE 1=1`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    if (severity) {
      sql += ` AND severity = ?`;
      args.push(severity);
    }

    sql += ` ORDER BY severity DESC, created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const alerts = result.rows.map((row: any) => ({
      id: row.id,
      alert_type: row.alert_type,
      severity: row.severity,
      title: row.title,
      description: row.description,
      status: row.status,
      assigned_to_agent_id: row.assigned_to_agent_id,
      resolution: row.resolution,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
      resolved_at: row.resolved_at,
    }));

    // Get summary counts
    const summaryResult = await turso.execute({
      sql: `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
              SUM(CASE WHEN severity = 'critical' AND status = 'open' THEN 1 ELSE 0 END) as critical_open
            FROM security_alerts`,
    });

    const summary = summaryResult.rows[0];

    return NextResponse.json({
      success: true,
      alerts,
      summary: {
        total: summary?.total || 0,
        open: summary?.open_count || 0,
        critical_open: summary?.critical_open || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


