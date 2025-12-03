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
    CREATE TABLE IF NOT EXISTS ceo_calls (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      companyId TEXT,
      callType TEXT NOT NULL,
      participant TEXT,
      topic TEXT,
      duration INTEGER,
      outcome TEXT,
      actionItems TEXT,
      nextSteps TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'scheduled',
      scheduledAt TEXT,
      completedAt TEXT,
      notes TEXT,
      metadata TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const {
      userId,
      companyId,
      callType,
      participant,
      topic,
      scheduledAt,
      priority,
      notes,
      metadata,
    } = body;

    if (!userId || !callType) {
      return NextResponse.json({ error: 'Missing userId or callType' }, { status: 400 });
    }

    const db = getDb();
    const callId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO ceo_calls 
            (id, userId, companyId, callType, participant, topic, scheduledAt, priority, notes, metadata, status)
            VALUES (:id, :userId, :companyId, :callType, :participant, :topic, :scheduledAt, :priority, :notes, :metadata, 'scheduled')`,
      args: {
        id: callId,
        userId,
        companyId: companyId || null,
        callType,
        participant: participant || null,
        topic: topic || null,
        scheduledAt: scheduledAt || null,
        priority: priority || 'medium',
        notes: notes || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      callId,
      status: 'scheduled',
      message: 'CEO call logged',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const callType = searchParams.get('callType');

    const db = getDb();

    if (callId) {
      // Get specific call
      const result = await db.execute({
        sql: `SELECT * FROM ceo_calls WHERE id = :id`,
        args: { id: callId },
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }

      const call = result.rows[0];
      return NextResponse.json({
        call: {
          id: call.id,
          userId: call.userId,
          companyId: call.companyId,
          callType: call.callType,
          participant: call.participant,
          topic: call.topic,
          duration: call.duration,
          outcome: call.outcome,
          actionItems: call.actionItems && typeof call.actionItems === 'string' ? JSON.parse(call.actionItems) : [],
          nextSteps: call.nextSteps,
          priority: call.priority,
          status: call.status,
          scheduledAt: call.scheduledAt,
          completedAt: call.completedAt,
          notes: call.notes,
          metadata: call.metadata && typeof call.metadata === 'string' ? JSON.parse(call.metadata) : null,
          createdAt: call.createdAt,
          updatedAt: call.updatedAt,
        },
      });
    }

    // List calls
    let sql = `SELECT * FROM ceo_calls WHERE 1=1`;
    const args: any = {};

    if (userId) {
      sql += ` AND userId = :userId`;
      args.userId = userId;
    }

    if (status) {
      sql += ` AND status = :status`;
      args.status = status;
    }

    if (callType) {
      sql += ` AND callType = :callType`;
      args.callType = callType;
    }

    sql += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
        ELSE 4 
      END,
      scheduledAt DESC, createdAt DESC
      LIMIT 50`;

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      calls: result.rows.map((row) => ({
        id: row.id,
        callType: row.callType,
        participant: row.participant,
        topic: row.topic,
        status: row.status,
        priority: row.priority,
        scheduledAt: row.scheduledAt,
        completedAt: row.completedAt,
        createdAt: row.createdAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { callId, status, duration, outcome, actionItems, nextSteps, notes } = body;

    if (!callId) {
      return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
    }

    const db = getDb();

    // Check if call exists
    const existing = await db.execute({
      sql: `SELECT * FROM ceo_calls WHERE id = :callId`,
      args: { callId },
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Build update query
    const updates: string[] = ["updatedAt = datetime('now')"];
    const args: any = { callId };

    if (status !== undefined) {
      updates.push('status = :status');
      args.status = status;
      if (status === 'completed') {
        updates.push("completedAt = datetime('now')");
      }
    }

    if (duration !== undefined) {
      updates.push('duration = :duration');
      args.duration = duration;
    }

    if (outcome !== undefined) {
      updates.push('outcome = :outcome');
      args.outcome = outcome;
    }

    if (actionItems !== undefined) {
      updates.push('actionItems = :actionItems');
      args.actionItems = JSON.stringify(actionItems);
    }

    if (nextSteps !== undefined) {
      updates.push('nextSteps = :nextSteps');
      args.nextSteps = nextSteps;
    }

    if (notes !== undefined) {
      updates.push('notes = :notes');
      args.notes = notes;
    }

    await db.execute({
      sql: `UPDATE ceo_calls SET ${updates.join(', ')} WHERE id = :callId`,
      args,
    });

    // Get updated call
    const updated = await db.execute({
      sql: `SELECT * FROM ceo_calls WHERE id = :callId`,
      args: { callId },
    });

    const call = updated.rows[0];

    return NextResponse.json({
      ok: true,
      call: {
        id: call.id,
        status: call.status,
        duration: call.duration,
        outcome: call.outcome,
        actionItems: call.actionItems && typeof call.actionItems === 'string' ? JSON.parse(call.actionItems) : [],
        nextSteps: call.nextSteps,
        completedAt: call.completedAt,
        updatedAt: call.updatedAt,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

