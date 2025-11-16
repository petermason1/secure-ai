import { getTursoClient } from '@/app/lib/turso';

export const dynamic = 'force-dynamic';

export default async function SalesConsolePage() {
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
  const result = await db.execute(
    `SELECT id, companyName, contactName, email, role, offer, workflowTarget, urgency, budgetBand, source, status, owner, createdAt
     FROM leads ORDER BY datetime(createdAt) DESC LIMIT 100;`,
  );

  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Sales Console</h1>
      <p style={{ color: '#94a3b8', marginBottom: 16 }}>
        Latest leads recorded from contact and sales pages.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid rgba(148,163,184,0.35)',
          }}
        >
          <thead>
            <tr style={{ background: 'rgba(148,163,184,0.08)' }}>
              {[
                'Created',
                'Company',
                'Contact',
                'Email',
                'Role',
                'Offer',
                'Workflow',
                'Urgency',
                'Budget',
                'Source',
                'Status',
              ].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: 10, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={String(r.id)} style={{ borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.createdAt ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.companyName ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.contactName ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.email ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.role ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.offer ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.workflowTarget ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.urgency ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.budgetBand ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.source ?? '')}</td>
                <td style={{ padding: 10, fontSize: 13 }}>{String(r.status ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


