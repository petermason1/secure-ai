import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }
  return createClient({ url, authToken: token });
}

async function ensureTables() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS kanban_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      companyId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'backlog',
      priority TEXT DEFAULT 'medium',
      assignee TEXT,
      estimatedCredits INTEGER,
      actualCredits INTEGER,
      tags TEXT,
      metadata TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT
    );
  `);
}

const VALID_STATUSES = ['backlog', 'todo', 'in-progress', 'inProgress', 'review', 'done', 'completed'];

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { taskId, newStatus, assignee, priority } = body;

    if (!taskId || !newStatus) {
      return NextResponse.json({ error: 'Missing taskId or newStatus' }, { status: 400 });
    }

    // Normalize status
    let normalizedStatus = newStatus.toLowerCase();
    if (normalizedStatus === 'inprogress') normalizedStatus = 'in-progress';
    if (normalizedStatus === 'completed') normalizedStatus = 'done';

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if task exists
    const existing = await db.execute({
      sql: `SELECT * FROM kanban_tasks WHERE id = :taskId`,
      args: { taskId },
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Build update query
    const updates: string[] = ['status = :newStatus', "updatedAt = datetime('now')"];
    const args: any = { taskId, newStatus: normalizedStatus };

    if (assignee !== undefined) {
      updates.push('assignee = :assignee');
      args.assignee = assignee;
    }

    if (priority !== undefined) {
      updates.push('priority = :priority');
      args.priority = priority;
    }

    // Set completedAt if moving to done
    if (normalizedStatus === 'done') {
      updates.push("completedAt = datetime('now')");
    } else {
      updates.push('completedAt = NULL');
    }

    await db.execute({
      sql: `UPDATE kanban_tasks SET ${updates.join(', ')} WHERE id = :taskId`,
      args,
    });

    // Get updated task
    const updated = await db.execute({
      sql: `SELECT * FROM kanban_tasks WHERE id = :taskId`,
      args: { taskId },
    });

    const task = updated.rows[0];

    return NextResponse.json({
      ok: true,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
      },
      message: `Task moved to ${normalizedStatus}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

