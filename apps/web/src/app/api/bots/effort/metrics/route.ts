import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    // Support both 'agent_id' and 'botId' for compatibility
    const agentId = searchParams.get('agent_id') || searchParams.get('botId');
    const period = searchParams.get('period') || 'day';

    const now = new Date();
    let startDate: string;
    
    if (period === 'day') {
      startDate = now.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    }

    if (agentId) {
      let summary, allocations;
      
      try {
        summary = await turso.execute({
          sql: `SELECT * FROM bot_effort_daily_summary
                WHERE agent_id = ? AND date >= ?
                ORDER BY date DESC`,
          args: [agentId, startDate],
        });
      } catch (error: any) {
        // Table might not exist yet - return empty data
        summary = { rows: [] };
      }

      try {
        allocations = await turso.execute({
          sql: `SELECT * FROM effort_allocations
                WHERE agent_id = ? AND (expires_at IS NULL OR expires_at > ?)
                ORDER BY created_at DESC
                LIMIT 20`,
          args: [agentId, new Date().toISOString()],
        });
      } catch (error: any) {
        // Table might not exist yet - return empty data
        allocations = { rows: [] };
      }

      const totals = summary.rows.reduce((acc, row) => {
        return {
          total_hours: acc.total_hours + (Number(row.total_hours) || 0),
          total_tasks: acc.total_tasks + (Number(row.tasks_completed) || 0),
          avg_priority: acc.avg_priority + (Number(row.priority_boost) || 0),
          total_resources: acc.total_resources + (Number(row.resources_allocated) || 0),
          count: acc.count + 1,
        };
      }, { total_hours: 0, total_tasks: 0, avg_priority: 0, total_resources: 0, count: 0 });

      const avgEffortScore = totals.count > 0 ? 
        summary.rows.reduce((sum, row) => sum + (Number(row.effort_score) || 0), 0) / totals.count : 0;

      return NextResponse.json({
        success: true,
        agent_id: agentId,
        period,
        metrics: {
          currentEffortScore: avgEffortScore,
          recentActivityCount: totals.total_tasks,
          totalHours: totals.total_hours,
          avgPriority: totals.count > 0 ? totals.avg_priority / totals.count : 0,
        },
        totals: {
          total_hours: totals.total_hours,
          total_tasks: totals.total_tasks,
          avg_priority: totals.count > 0 ? totals.avg_priority / totals.count : 0,
          total_resources: totals.total_resources,
          avg_effort_score: avgEffortScore,
        },
        daily_summaries: summary.rows.map(row => ({
          date: row.date,
          total_hours: Number(row.total_hours) || 0,
          tasks_completed: Number(row.tasks_completed) || 0,
          priority_boost: Number(row.priority_boost) || 0,
          resources_allocated: Number(row.resources_allocated) || 0,
          effort_score: Number(row.effort_score) || 0,
        })),
        active_allocations: allocations.rows.map(row => ({
          id: row.id,
          effort_type: row.effort_type,
          effort_amount: Number(row.effort_amount) || 0,
          reason: row.reason,
          expires_at: row.expires_at,
          created_at: row.created_at,
        })),
      });
    } else {
      let summaries;
      try {
        summaries = await turso.execute({
          sql: `SELECT s.*, a.name as agent_name
                FROM bot_effort_daily_summary s
                JOIN agents a ON s.agent_id = a.id
                WHERE s.date >= ?
                ORDER BY s.effort_score DESC, s.date DESC`,
          args: [startDate],
        });
      } catch (error: any) {
        // Table might not exist yet - return empty data
        summaries = { rows: [] };
      }

      const agentMetrics: Record<string, any> = {};
      
      summaries.rows.forEach((row: any) => {
        const aid = String(row.agent_id);
        if (!agentMetrics[aid]) {
          agentMetrics[aid] = {
            agent_id: aid,
            agent_name: String(row.agent_name),
            total_hours: 0,
            total_tasks: 0,
            avg_priority: 0,
            total_resources: 0,
            avg_effort_score: 0,
            days_count: 0,
          };
        }
        const m = agentMetrics[aid];
        m.total_hours += Number(row.total_hours) || 0;
        m.total_tasks += Number(row.tasks_completed) || 0;
        m.avg_priority += Number(row.priority_boost) || 0;
        m.total_resources += Number(row.resources_allocated) || 0;
        m.avg_effort_score += Number(row.effort_score) || 0;
        m.days_count += 1;
      });

      Object.values(agentMetrics).forEach((m: any) => {
        if (m.days_count > 0) {
          m.avg_priority = m.avg_priority / m.days_count;
          m.avg_effort_score = m.avg_effort_score / m.days_count;
        }
      });

      return NextResponse.json({
        success: true,
        period,
        agents: Object.values(agentMetrics).sort((a: any, b: any) => 
          b.avg_effort_score - a.avg_effort_score
        ),
      });
    }
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
