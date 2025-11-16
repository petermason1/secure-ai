import { NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET() {
  try {
    const client = getTursoClient();

    const requests = await client.execute({
      sql: `SELECT id, title, status, created_at FROM project_manager_requests ORDER BY datetime(created_at) DESC LIMIT 50`,
    });

    const assignments = await client.execute({
      sql: `SELECT request_id, department, status, last_reminder_at FROM project_manager_assignments`,
    });

    return NextResponse.json({
      requests: requests.rows,
      assignments: assignments.rows,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to fetch status' },
      { status: handled.code || 500 },
    );
  }
}

