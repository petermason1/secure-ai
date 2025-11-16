import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const action_type = searchParams.get('action_type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `SELECT * FROM security_audit_log WHERE 1=1`;
    const args: any[] = [];

    if (action_type) {
      sql += ` AND action_type = ?`;
      args.push(action_type);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const logs = result.rows.map((row: any) => ({
      id: row.id,
      action_type: row.action_type,
      user_id: row.user_id,
      agent_id: row.agent_id,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      action_description: row.action_description,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


