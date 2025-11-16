import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get all L&D team agents
    const result = await turso.execute({
      sql: `SELECT a.id, a.name, a.status, a.capabilities, a.config, a.metadata, a.created_at
            FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE d.id = 'learning-dev-team'
            ORDER BY a.name`,
    });

    const agents = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      config: JSON.parse(String(row.config || '{}')),
      metadata: JSON.parse(String(String(row.metadata || '{}'))),
      background: JSON.parse(String(String(row.metadata || '{}'))).background,
      expertise: JSON.parse(String(String(row.metadata || '{}'))).expertise,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      department: 'Learning & Development Team',
      count: agents.length,
      agents,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
