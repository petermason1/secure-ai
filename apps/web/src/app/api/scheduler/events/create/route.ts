import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const {
      title,
      description,
      start_time,
      end_time,
      timezone = 'UTC',
      location,
      tags = [],
    } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'title, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    const eventId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO schedule_events
            (id, title, description, start_time, end_time, timezone, location, tags, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        eventId,
        title,
        description || null,
        start_time,
        end_time,
        timezone,
        location || null,
        JSON.stringify(tags),
        'user',
      ],
    });

    return NextResponse.json({
      success: true,
      event: {
        id: eventId,
        title,
        description,
        start_time,
        end_time,
        timezone,
        location,
        tags,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create event', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

