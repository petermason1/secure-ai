import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Code Editor Department
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%Code Editor%' OR d.name LIKE '%code%editor%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agents: [],
        stats: {
          projects_count: 0,
          files_count: 0,
          suggestions_count: 0,
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
    const projectsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM code_projects WHERE status = 'active'`,
    });
    const filesResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM code_files`,
    });
    const suggestionsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM ai_code_suggestions WHERE status = 'pending'`,
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
        projects_count: projectsResult.rows[0]?.count || 0,
        files_count: filesResult.rows[0]?.count || 0,
        suggestions_count: suggestionsResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Code Editor Department' },
      { status: handled.code || 500 }
    );
  }
}

