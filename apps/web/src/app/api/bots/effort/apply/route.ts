import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const {
      agent_id,
      effort_amount,
      effort_type = 'time',
      reason,
      duration_minutes,
      allocated_by = 'user',
    } = body;

    if (!agent_id || effort_amount === undefined) {
      return NextResponse.json(
        { error: 'agent_id and effort_amount are required' },
        { status: 400 }
      );
    }

    const agentCheck = await turso.execute({
      sql: 'SELECT id, name FROM agents WHERE id = ?',
      args: [agent_id],
    });

    if (agentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = agentCheck.rows[0];
    const agentName = String(agent.name);
    const expiresAt = duration_minutes
      ? new Date(Date.now() + duration_minutes * 60 * 1000).toISOString()
      : null;

    const allocationId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO effort_allocations 
            (id, agent_id, allocated_by, effort_amount, effort_type, reason, duration_minutes, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        allocationId,
        agent_id,
        allocated_by,
        effort_amount,
        effort_type,
        reason || null,
        duration_minutes || null,
        expiresAt,
        now,
      ],
    });

    const today = new Date().toISOString().split('T')[0];
    const summaryCheck = await turso.execute({
      sql: `SELECT id, total_hours, priority_boost, resources_allocated, effort_score
            FROM bot_effort_daily_summary
            WHERE agent_id = ? AND date = ?`,
      args: [agent_id, today],
    });

    if (summaryCheck.rows.length > 0) {
      const current = summaryCheck.rows[0];
      let newHours = Number(current.total_hours) || 0;
      let newPriority = Number(current.priority_boost) || 0;
      let newResources = Number(current.resources_allocated) || 0;

      if (effort_type === 'time') {
        newHours = newHours + Number(effort_amount);
      } else if (effort_type === 'priority') {
        newPriority = Math.min(100, newPriority + Number(effort_amount));
      } else if (effort_type === 'resources') {
        newResources = newResources + Number(effort_amount);
      }

      const effortScore = (newHours * 0.4) + (newPriority * 0.35) + (newResources * 0.25);

      await turso.execute({
        sql: `UPDATE bot_effort_daily_summary
              SET total_hours = ?, priority_boost = ?, resources_allocated = ?, effort_score = ?, updated_at = ?
              WHERE agent_id = ? AND date = ?`,
        args: [newHours, newPriority, newResources, effortScore, now, agent_id, today],
      });
    } else {
      let hours = 0;
      let priority = 0;
      let resources = 0;

      if (effort_type === 'time') hours = Number(effort_amount);
      else if (effort_type === 'priority') priority = Number(effort_amount);
      else if (effort_type === 'resources') resources = Number(effort_amount);

      const effortScore = (hours * 0.4) + (priority * 0.35) + (resources * 0.25);
      const summaryId = randomUUID();

      await turso.execute({
        sql: `INSERT INTO bot_effort_daily_summary
              (id, agent_id, date, total_hours, priority_boost, resources_allocated, effort_score, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [summaryId, agent_id, today, hours, priority, resources, effortScore, now, now],
      });
    }

    const metricId = randomUUID();
    const unit = effort_type === 'time' ? 'hours' : 
                 effort_type === 'priority' ? 'percentage' : 
                 effort_type === 'resources' ? 'units' : 'points';

    await turso.execute({
      sql: `INSERT INTO bot_effort_metrics
            (id, agent_id, metric_type, value, unit, period_start, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        metricId,
        agent_id,
        effort_type === 'time' ? 'time_spent' :
        effort_type === 'priority' ? 'priority_boost' :
        effort_type === 'resources' ? 'resources_allocated' : 'manual_intervention',
        effort_amount,
        unit,
        now,
        JSON.stringify({ reason, duration_minutes, allocated_by }),
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      allocation_id: allocationId,
      agent_id,
      agent_name: agentName,
      effort_applied: { type: effort_type, amount: effort_amount, unit },
      expires_at: expiresAt,
      message: `Applied ${effort_amount} ${unit} of ${effort_type} to ${agentName}`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
