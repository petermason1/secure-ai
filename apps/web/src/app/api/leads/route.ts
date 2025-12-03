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

async function ensureTable() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,
      companyName TEXT,
      contactName TEXT,
      email TEXT,
      role TEXT,
      offer TEXT,
      workflowTarget TEXT,
      urgency TEXT,
      budgetBand TEXT,
      source TEXT,
      notes TEXT,
      status TEXT DEFAULT 'New',
      owner TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function GET(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const owner = searchParams.get('owner');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getDb();
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const args: any = {};

    if (status) {
      sql += ` AND status = :status`;
      args.status = status;
    }

    if (owner) {
      sql += ` AND owner = :owner`;
      args.owner = owner;
    }

    sql += ` ORDER BY createdAt DESC LIMIT :limit`;
    args.limit = limit;

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      leads: result.rows.map((row) => ({
        id: row.id,
        companyName: row.companyName,
        contactName: row.contactName,
        email: row.email,
        role: row.role,
        offer: row.offer,
        workflowTarget: row.workflowTarget,
        urgency: row.urgency,
        budgetBand: row.budgetBand,
        source: row.source,
        status: row.status,
        owner: row.owner,
        createdAt: row.createdAt,
      })),
      count: result.rows.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const required = ['companyName', 'email', 'offer'] as const;
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
      }
    }
    const id = crypto.randomUUID();
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO leads
        (id, companyName, contactName, email, role, offer, workflowTarget, urgency, budgetBand, source, notes, status, owner)
        VALUES
        (:id, :companyName, :contactName, :email, :role, :offer, :workflowTarget, :urgency, :budgetBand, :source, :notes, COALESCE(:status,'New'), :owner)`,
      args: {
        id,
        companyName: body.companyName ?? '',
        contactName: body.contactName ?? '',
        email: body.email ?? '',
        role: body.role ?? '',
        offer: body.offer ?? '',
        workflowTarget: body.workflowTarget ?? '',
        urgency: body.urgency ?? '',
        budgetBand: body.budgetBand ?? '',
        source: body.source ?? '',
        notes: body.notes ?? '',
        status: body.status ?? 'New',
        owner: body.owner ?? '',
      },
    });
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}


