import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get security bot agents
    const agentsResult = await turso.execute({
      sql: `SELECT a.id, a.name, a.status, a.capabilities, a.metadata, a.updated_at
            FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE (d.name LIKE '%security%' OR d.name LIKE '%Security%')
            AND a.status = 'active'
            ORDER BY a.name`,
    });

    const bots = agentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: 'bot',
      status: row.status,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
      last_activity: row.updated_at,
      avatar: JSON.parse(String(row.metadata || '{}')).icon || '🔒',
    }));

    // Get human team members
    const membersResult = await turso.execute({
      sql: `SELECT * FROM security_team_members 
            WHERE status = 'active'
            ORDER BY role, name`,
    });

    const members = membersResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: 'human',
      email: row.email,
      role: row.role,
      expertise: JSON.parse(String(row.expertise || '[]')),
      avatar_url: row.avatar_url,
      status: row.status,
      last_activity: row.last_activity,
    }));

    return NextResponse.json({
      success: true,
      bots,
      members,
      total: bots.length + members.length,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


