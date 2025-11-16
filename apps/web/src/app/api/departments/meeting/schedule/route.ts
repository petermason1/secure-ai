import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { department_ids, meeting_type, scheduled_time, duration_minutes, agenda, priority } = body;

    if (!department_ids || !Array.isArray(department_ids) || department_ids.length < 2) {
      return NextResponse.json(
        { error: 'department_ids must be an array with at least 2 departments' },
        { status: 400 }
      );
    }

    if (!meeting_type || !scheduled_time) {
      return NextResponse.json(
        { error: 'meeting_type and scheduled_time are required' },
        { status: 400 }
      );
    }

    const meetingId = randomUUID();
    const now = new Date().toISOString();

    // Store meeting
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        meetingId,
        department_ids[0],
        null,
        'inter_department_meeting',
        'meeting',
        meetingId,
        JSON.stringify({
          meeting_type,
          scheduled_time,
          duration_minutes: duration_minutes || 30,
          agenda: agenda || null,
          priority: priority || 'medium',
          participants: department_ids,
          status: 'scheduled',
        }),
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      meeting_id: meetingId,
      meeting: {
        type: meeting_type,
        participants: department_ids,
        scheduled_time,
        duration_minutes: duration_minutes || 30,
        agenda,
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
