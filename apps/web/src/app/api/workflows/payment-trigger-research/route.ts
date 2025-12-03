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
    CREATE TABLE IF NOT EXISTS workflow_research (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      companyId TEXT,
      workflowType TEXT NOT NULL,
      trigger TEXT NOT NULL,
      context TEXT,
      findings TEXT,
      recommendations TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      estimatedImpact TEXT,
      creditsUsed INTEGER,
      metadata TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT
    );
  `);
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { userId, companyId, workflowType, trigger, context, priority } = body;

    if (!userId || !workflowType || !trigger) {
      return NextResponse.json(
        { error: 'Missing userId, workflowType, or trigger' },
        { status: 400 }
      );
    }

    const db = getDb();
    const researchId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO workflow_research 
            (id, userId, companyId, workflowType, trigger, context, priority, status)
            VALUES (:id, :userId, :companyId, :workflowType, :trigger, :context, :priority, 'queued')`,
      args: {
        id: researchId,
        userId,
        companyId: companyId || null,
        workflowType,
        trigger,
        context: context ? JSON.stringify(context) : null,
        priority: priority || 'medium',
      },
    });

    // In a real implementation, this would trigger automated research
    // For now, return the research task
    return NextResponse.json({
      ok: true,
      researchId,
      status: 'queued',
      message: 'Workflow research task created',
      nextSteps: [
        'Research will analyze payment triggers and workflow patterns',
        'Check status via GET /api/workflows/payment-trigger-research?id=' + researchId,
        'Results will include findings and recommendations',
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(req.url);
    const researchId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const workflowType = searchParams.get('workflowType');
    const status = searchParams.get('status');

    const db = getDb();

    if (researchId) {
      // Get specific research
      const result = await db.execute({
        sql: `SELECT * FROM workflow_research WHERE id = :id`,
        args: { id: researchId },
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Research not found' }, { status: 404 });
      }

      const research = result.rows[0];
      return NextResponse.json({
        research: {
          id: research.id,
          userId: research.userId,
          companyId: research.companyId,
          workflowType: research.workflowType,
          trigger: research.trigger,
          context: research.context && typeof research.context === 'string' ? JSON.parse(research.context) : null,
          findings: research.findings,
          recommendations: research.recommendations,
          status: research.status,
          priority: research.priority,
          estimatedImpact: research.estimatedImpact,
          creditsUsed: research.creditsUsed,
          metadata: research.metadata && typeof research.metadata === 'string' ? JSON.parse(research.metadata) : null,
          createdAt: research.createdAt,
          completedAt: research.completedAt,
        },
      });
    }

    // List research tasks
    let sql = `SELECT * FROM workflow_research WHERE 1=1`;
    const args: any = {};

    if (userId) {
      sql += ` AND userId = :userId`;
      args.userId = userId;
    }

    if (workflowType) {
      sql += ` AND workflowType = :workflowType`;
      args.workflowType = workflowType;
    }

    if (status) {
      sql += ` AND status = :status`;
      args.status = status;
    }

    sql += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
        ELSE 4 
      END,
      createdAt DESC
      LIMIT 50`;

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      research: result.rows.map((row) => ({
        id: row.id,
        workflowType: row.workflowType,
        trigger: row.trigger,
        status: row.status,
        priority: row.priority,
        estimatedImpact: row.estimatedImpact,
        createdAt: row.createdAt,
        completedAt: row.completedAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

