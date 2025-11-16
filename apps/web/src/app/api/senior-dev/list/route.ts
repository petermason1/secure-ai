import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Senior Dev Department
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%Senior Dev%' OR d.name LIKE '%senior dev%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agent: null,
        stats: {
          reviews_completed: 0,
          issues_found: 0,
          critical_issues: 0,
        },
      });
    }

    const dept = deptResult.rows[0];

    // Get agent
    const agentResult = await turso.execute({
      sql: `SELECT * FROM agents WHERE department_id = ? LIMIT 1`,
      args: [dept.id],
    });

    const agent = agentResult.rows[0] ? {
      id: agentResult.rows[0].id,
      name: agentResult.rows[0].name,
      status: agentResult.rows[0].status,
      type: agentResult.rows[0].type,
      capabilities: JSON.parse(String(agentResult.rows[0].capabilities || '[]')),
      metadata: JSON.parse(String(agentResult.rows[0].metadata || '{}')),
    } : null;

    // Get stats
    const reviewsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM senior_dev_reviews WHERE status = 'completed'`,
    });
    const issuesResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM senior_dev_issues WHERE status = 'open'`,
    });
    const criticalResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM senior_dev_issues WHERE severity = 'critical' AND status = 'open'`,
    });

    return NextResponse.json({
      success: true,
      department: {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        status: dept.status,
      },
      agent,
      stats: {
        reviews_completed: reviewsResult.rows[0]?.count || 0,
        issues_found: issuesResult.rows[0]?.count || 0,
        critical_issues: criticalResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Senior Dev Department' },
      { status: handled.code || 500 }
    );
  }
}

