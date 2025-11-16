import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get all tasks assigned to junior dev team
    const result = await turso.execute({
      sql: `SELECT id, agent_id, action, resource_id, details, created_at
            FROM audit_logs
            WHERE department_id = 'junior-dev-team' AND action = 'task_assigned'
            ORDER BY created_at DESC
            LIMIT 50`,
    });

    const tasks = result.rows.map((row: any) => {
      const details = JSON.parse(String(String(row.details || '{}')));
      return {
        id: row.id,
        agent_id: row.agent_id,
        task_type: details.task_type,
        description: details.description,
        priority: details.priority,
        assigned_to: details.assigned_to,
        file_path: details.file_path,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
