import { NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/app/lib/turso';

type LeadPayload = {
  companyName?: string;
  contactName?: string;
  email?: string;
  role?: string;
  offer?: string;
  workflowTarget?: string;
  urgency?: string;
  budgetBand?: string;
  source?: string;
  notes?: string;
  status?: string;
  owner?: string;
};

async function ensureTable() {
  const db = getTursoClient();
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

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = (await request.json()) as LeadPayload;
    const required = ['companyName', 'email', 'offer'] as const;
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
      }
    }
    const id = crypto.randomUUID();
    const db = getTursoClient();
    await db.execute({
      sql: `
        INSERT INTO leads
        (id, companyName, contactName, email, role, offer, workflowTarget, urgency, budgetBand, source, notes, status, owner)
        VALUES
        (:id, :companyName, :contactName, :email, :role, :offer, :workflowTarget, :urgency, :budgetBand, :source, :notes, COALESCE(:status,'New'), :owner)
      `,
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
  } catch (error: any) {
    const { error: msg, code } = handleTursoError(error);
    return NextResponse.json({ error: msg }, { status: code });
  }
}

export async function GET() {
  try {
    await ensureTable();
    const db = getTursoClient();
    const result = await db.execute(
      `SELECT id, companyName, contactName, email, role, offer, workflowTarget, urgency, budgetBand, source, status, owner, createdAt
       FROM leads ORDER BY datetime(createdAt) DESC LIMIT 100;`,
    );
    return NextResponse.json({ rows: result.rows });
  } catch (error: any) {
    const { error: msg, code } = handleTursoError(error);
    return NextResponse.json({ error: msg }, { status: code });
  }
}


