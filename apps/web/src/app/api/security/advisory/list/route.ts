import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM security_advisories WHERE 1=1`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    if (priority) {
      sql += ` AND priority = ?`;
      args.push(priority);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const advisories = result.rows.map((row: any) => ({
      id: row.id,
      question: row.question,
      context: row.context,
      status: row.status,
      priority: row.priority,
      asked_by: row.asked_by,
      answered_by_agent_id: row.answered_by_agent_id,
      response: row.response ? JSON.parse(String(row.response)) : null,
      advisory_data: row.advisory_data ? JSON.parse(String(row.advisory_data)) : null,
      tags: JSON.parse(String(row.tags || '[]')),
      created_at: row.created_at,
      answered_at: row.answered_at,
      resolved_at: row.resolved_at,
    }));

    return NextResponse.json({
      success: true,
      count: advisories.length,
      advisories,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


