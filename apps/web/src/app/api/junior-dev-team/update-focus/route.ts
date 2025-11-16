import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { agent_id, new_task_type, new_description, new_priority, file_path } = body;

    if (!agent_id || !new_description) {
      return NextResponse.json(
        { error: 'agent_id and new_description are required' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agentCheck = await turso.execute({
      sql: 'SELECT id, name, department_id FROM agents WHERE id = ?',
      args: [agent_id],
    });

    if (agentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = agentCheck.rows[0];
    const agentName = String(agent.name || 'Unknown');
    const departmentId = String(agent.department_id || 'junior-dev-team');

    // Create new task record
    const taskId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        taskId,
        departmentId,
        agent_id,
        'focus_changed',
        'task',
        taskId,
        JSON.stringify({
          task_type: new_task_type || 'documentation',
          description: new_description,
          priority: new_priority || 'medium',
          file_path: file_path || null,
          previous_focus: 'changed_by_user',
        }),
        now,
      ],
    });

    // Update agent's latest task in metadata (if metadata exists)
    try {
      const currentAgent = await turso.execute({
        sql: 'SELECT metadata FROM agents WHERE id = ?',
        args: [agent_id],
      });

      if (currentAgent.rows.length > 0) {
        const metadataValue = currentAgent.rows[0].metadata;
        const currentMetadata = metadataValue && typeof metadataValue === 'string'
          ? JSON.parse(metadataValue)
          : (metadataValue || {});
        
        currentMetadata.latest_task = {
          type: new_task_type || 'documentation',
          description: new_description,
          priority: new_priority || 'medium',
          assigned_at: now,
        };

        await turso.execute({
          sql: 'UPDATE agents SET metadata = ?, updated_at = ? WHERE id = ?',
          args: [JSON.stringify(currentMetadata), now, agent_id],
        });
      }
    } catch (metadataError) {
      // Non-critical, continue
      console.error('Error updating agent metadata:', metadataError);
    }

    return NextResponse.json({
      success: true,
      task_id: taskId,
      agent_id,
      agent_name: agentName,
      new_focus: {
        type: new_task_type || 'documentation',
        description: new_description,
        priority: new_priority || 'medium',
      },
      message: `${agentName} focus updated successfully`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
