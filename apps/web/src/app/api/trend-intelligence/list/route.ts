import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Trend Intelligence Bot
    const agentResult = await turso.execute({
      sql: `SELECT a.*, d.name as department_name
            FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE a.name LIKE '%Trend Intelligence%'`,
    });

    if (agentResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        agent: null,
        stats: {
          trends_analyzed: 0,
          content_generated: 0,
          patterns_learned: 0,
        },
      });
    }

    const agent = agentResult.rows[0];

    // Get stats
    const trendsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM trend_analysis`,
    });
    const contentResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM trending_content_ideas`,
    });
    const patternsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM trend_patterns`,
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        department: agent.department_name,
        capabilities: JSON.parse(String(agent.capabilities || '[]')),
        metadata: JSON.parse(String(agent.metadata || '{}')),
      },
      stats: {
        trends_analyzed: trendsResult.rows[0]?.count || 0,
        content_generated: contentResult.rows[0]?.count || 0,
        patterns_learned: patternsResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Trend Intelligence Bot' },
      { status: handled.code || 500 }
    );
  }
}

