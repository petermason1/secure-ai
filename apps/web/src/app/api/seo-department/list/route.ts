import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get SEO Department and agents
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%SEO%' OR d.name LIKE '%seo%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agents: [],
        stats: {
          keywords_tracked: 0,
          backlinks: 0,
          tasks_pending: 0,
        },
      });
    }

    const dept = deptResult.rows[0];

    // Get agents
    const agentsResult = await turso.execute({
      sql: `SELECT * FROM agents WHERE department_id = ? ORDER BY name`,
      args: [dept.id],
    });

    const agents = agentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
    }));

    // Get stats
    const keywordsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM seo_keywords WHERE status = 'tracking'`,
    });
    const backlinksResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM seo_backlinks WHERE status = 'active'`,
    });
    const tasksResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM seo_tasks WHERE status = 'pending'`,
    });

    return NextResponse.json({
      success: true,
      department: {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        status: dept.status,
      },
      agents,
      stats: {
        keywords_tracked: keywordsResult.rows[0]?.count || 0,
        backlinks: backlinksResult.rows[0]?.count || 0,
        tasks_pending: tasksResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list SEO Department' },
      { status: handled.code || 500 }
    );
  }
}

