import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Value Optimization Department
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%Value Optimization%' OR d.name LIKE '%value%optimization%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agent: null,
        stats: {
          total_opportunities: 0,
          total_potential_value: 0,
          completed_opportunities: 0,
          value_realized: 0,
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
      capabilities: JSON.parse(String(agentResult.rows[0].capabilities || '[]')),
      metadata: JSON.parse(String(agentResult.rows[0].metadata || '{}')),
    } : null;

    // Get stats
    const oppsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count, SUM(estimated_value_impact) as total FROM value_opportunities`,
    });
    const completedResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM value_opportunities WHERE status = 'completed'`,
    });
    const valueResult = await turso.execute({
      sql: `SELECT SUM(value_add) as total FROM value_impact_tracking`,
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
        total_opportunities: oppsResult.rows[0]?.count || 0,
        total_potential_value: oppsResult.rows[0]?.total || 0,
        completed_opportunities: completedResult.rows[0]?.count || 0,
        value_realized: valueResult.rows[0]?.total || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Value Optimization Department' },
      { status: handled.code || 500 }
    );
  }
}

