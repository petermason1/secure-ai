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
    CREATE TABLE IF NOT EXISTS jit_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      companyId TEXT,
      task TEXT NOT NULL,
      context TEXT,
      status TEXT DEFAULT 'active',
      assignedAgent TEXT,
      estimatedCredits INTEGER,
      actualCredits INTEGER,
      startedAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT,
      result TEXT
    );
  `);
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { userId, companyId, task, context, priority } = body;

    if (!userId || !task) {
      return NextResponse.json({ error: 'Missing userId or task' }, { status: 400 });
    }

    const db = getDb();
    const sessionId = crypto.randomUUID();

    // Estimate credits based on task complexity
    const estimatedCredits = estimateCredits(task, context);

    await db.execute({
      sql: `INSERT INTO jit_sessions 
            (id, userId, companyId, task, context, status, estimatedCredits)
            VALUES (:id, :userId, :companyId, :task, :context, 'queued', :estimatedCredits)`,
      args: {
        id: sessionId,
        userId,
        companyId: companyId || null,
        task,
        context: context ? JSON.stringify(context) : null,
        estimatedCredits,
      },
    });

    // In a real implementation, this would trigger an AI agent
    // For now, we'll return the session with a status
    return NextResponse.json({
      ok: true,
      sessionId,
      status: 'queued',
      estimatedCredits,
      message: 'JIT session created. Agent will be assigned shortly.',
      nextSteps: [
        'Check session status via GET /api/junior-dev-team/jit/activate?id=' + sessionId,
        'Monitor progress in kanban board',
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

function estimateCredits(task: string, context: any): number {
  // Simple estimation based on task length and complexity
  const baseCredits = 10;
  const taskLength = task.length;
  const hasContext = context && Object.keys(context).length > 0;
  
  if (taskLength < 100) return baseCredits;
  if (taskLength < 500) return baseCredits * 2;
  if (hasContext) return baseCredits * 3;
  return baseCredits * 4;
}

export async function GET(req: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const db = getDb();

    if (sessionId) {
      // Get specific session
      const result = await db.execute({
        sql: `SELECT * FROM jit_sessions WHERE id = :id`,
        args: { id: sessionId },
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = result.rows[0];
      return NextResponse.json({
        session: {
          id: session.id,
          userId: session.userId,
          companyId: session.companyId,
          task: session.task,
          context: session.context && typeof session.context === 'string' ? JSON.parse(session.context) : null,
          status: session.status,
          assignedAgent: session.assignedAgent,
          estimatedCredits: session.estimatedCredits,
          actualCredits: session.actualCredits,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          result: session.result,
        },
      });
    }

    // List sessions
    let sql = `SELECT * FROM jit_sessions WHERE 1=1`;
    const args: any = {};

    if (userId) {
      sql += ` AND userId = :userId`;
      args.userId = userId;
    }

    if (status) {
      sql += ` AND status = :status`;
      args.status = status;
    }

    sql += ` ORDER BY startedAt DESC LIMIT 50`;

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      sessions: result.rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        task: row.task,
        status: row.status,
        estimatedCredits: row.estimatedCredits,
        startedAt: row.startedAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

