import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let sql = `SELECT * FROM schedule_events WHERE start_time >= datetime('now','-1 day')`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY start_time ASC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const events = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      start_time: row.start_time,
      end_time: row.end_time,
      timezone: row.timezone,
      location: row.location,
      status: row.status,
      tags: JSON.parse(String(row.tags || '[]')),
      created_by: row.created_by,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list events', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

