import { NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { appendFileSync } from 'fs';
import { resolve } from 'path';

const LOG_PATH = resolve(process.env.HUMAN_LOG ?? '/Users/petermason/secure_logs/manual-control.log');

function log(entry: Record<string, unknown>) {
  appendFileSync(LOG_PATH, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n', { mode: 0o600 });
}

export async function POST() {
  try {
    const client = getTursoClient();
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { rows } = await client.execute({
      sql: `SELECT id, request_id, department, status, last_reminder_at
            FROM project_manager_assignments
            WHERE status = 'pending'
              AND (last_reminder_at IS NULL OR last_reminder_at < ?)
            LIMIT 20`,
      args: [threshold],
    });

    for (const row of rows) {
      await client.execute({
        sql: `UPDATE project_manager_assignments SET last_reminder_at = datetime('now') WHERE id = ?`,
        args: [row.id],
      });
      log({ action: 'pm_bot_reminder', request_id: row.request_id, department: row.department });
    }

    return NextResponse.json({ success: true, reminders_sent: rows.length });
  } catch (error: any) {
    const handled = handleTursoError(error);
    log({ action: 'pm_bot_reminder_error', error: handled.error });
    return NextResponse.json({ error: handled.error }, { status: handled.code || 500 });
  }
}

