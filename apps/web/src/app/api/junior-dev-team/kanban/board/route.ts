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

export async function GET(req: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    const db = getDb();
    let sql = `SELECT * FROM kanban_tasks WHERE 1=1`;
    const args: any = {};

    if (userId) {
      sql += ` AND userId = :userId`;
      args.userId = userId;
    }

    if (companyId) {
      sql += ` AND companyId = :companyId`;
      args.companyId = companyId;
    }

    sql += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
        ELSE 4 
      END,
      createdAt DESC`;

    const result = await db.execute({ sql, args });

    // Group by status
    const board = {
      backlog: [] as any[],
      todo: [] as any[],
      inProgress: [] as any[],
      review: [] as any[],
      done: [] as any[],
    };

    result.rows.forEach((row) => {
      const task = {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignee: row.assignee,
        estimatedCredits: row.estimatedCredits,
        actualCredits: row.actualCredits,
        tags: row.tags && typeof row.tags === 'string' ? JSON.parse(row.tags) : [],
        metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        completedAt: row.completedAt,
      };

      const status = row.status as string;
      if (status === 'backlog') board.backlog.push(task);
      else if (status === 'todo') board.todo.push(task);
      else if (status === 'in-progress' || status === 'inProgress') board.inProgress.push(task);
      else if (status === 'review') board.review.push(task);
      else if (status === 'done' || status === 'completed') board.done.push(task);
      else board.backlog.push(task); // Default to backlog
    });

    return NextResponse.json({ board });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { userId, companyId, title, description, priority, tags } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 });
    }

    const db = getDb();
    const taskId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO kanban_tasks 
            (id, userId, companyId, title, description, status, priority, tags)
            VALUES (:id, :userId, :companyId, :title, :description, 'backlog', :priority, :tags)`,
      args: {
        id: taskId,
        userId,
        companyId: companyId || null,
        title,
        description: description || null,
        priority: priority || 'medium',
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      taskId,
      message: 'Task created in backlog',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

