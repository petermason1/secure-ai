import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const department1 = searchParams.get('department1');
    const department2 = searchParams.get('department2');

    let query = `SELECT id, department_id, action, resource_id, details, created_at
            FROM audit_logs
            WHERE action = 'inter_department_meeting'`;
    const args: any[] = [];

    if (department1 && department2) {
      query += ` AND (
        details LIKE ? OR
        details LIKE ?
      )`;
      args.push(`%${department1}%`, `%${department2}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await turso.execute({ sql: query, args });

    const meetings = result.rows.map((row: any) => {
      const details = JSON.parse(String(String(row.details || '{}')));
      return {
        id: row.id,
        participants: details.participants || [],
        meeting_type: details.meeting_type,
        scheduled_time: details.scheduled_time,
        duration_minutes: details.duration_minutes,
        agenda: details.agenda,
        status: details.status,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
