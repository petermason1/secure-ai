import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { appendFileSync } from 'fs';
import { resolve } from 'path';
import { getTursoClient, handleTursoError } from '@/lib/turso';

const LOG_PATH = resolve(process.env.HUMAN_LOG ?? '/Users/petermason/secure_logs/manual-control.log');

function logAction(entry: Record<string, unknown>) {
  appendFileSync(LOG_PATH, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n', { mode: 0o600 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description = '',
      flags = [],
      departments = [],
    }: {
      title?: string;
      description?: string;
      flags?: string[];
      departments?: string[];
    } = body || {};

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const requestId = randomUUID();
    const client = getTursoClient();

    await client.execute({
      sql: `INSERT INTO project_manager_requests (id, title, description, flags) VALUES (?, ?, ?, ?)`,
      args: [requestId, title, description, JSON.stringify(flags)],
    });

    for (const dept of departments) {
      await client.execute({
        sql: `INSERT INTO project_manager_assignments (id, request_id, department) VALUES (?, ?, ?)`,
        args: [randomUUID(), requestId, dept],
      });
    }

    logAction({ action: 'project_manager_request', requestId, title, departments });

    return NextResponse.json({
      success: true,
      request_id: requestId,
      assignments: departments.length,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    logAction({ action: 'project_manager_request_error', error: handled.error });
    return NextResponse.json(
      { error: handled.error || 'Failed to register request' },
      { status: handled.code || 500 },
    );
  }
}

