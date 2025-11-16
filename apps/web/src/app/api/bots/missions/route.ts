import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const agent_id = searchParams.get('agent_id');
    const status = searchParams.get('status');

    let query = `SELECT m.*, a.name as agent_name, a.metadata as agent_metadata
            FROM bot_missions m
            JOIN agents a ON m.agent_id = a.id`;
    const args: any[] = [];

    if (agent_id) {
      query += ` WHERE m.agent_id = ?`;
      args.push(agent_id);
    } else if (status) {
      query += ` WHERE m.status = ?`;
      args.push(status);
    }

    query += ` ORDER BY m.created_at DESC LIMIT 100`;

    const result = await turso.execute({ sql: query, args });

    const missions = result.rows.map((row: any) => ({
      id: row.id,
      agent_id: row.agent_id,
      agent_name: row.agent_name,
      title: row.title,
      description: row.description,
      mission_type: row.mission_type,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      target_value: row.target_value,
      current_value: row.current_value,
      reward: row.reward,
      deadline: row.deadline,
      created_at: row.created_at,
      completed_at: row.completed_at,
    }));

    return NextResponse.json({
      success: true,
      count: missions.length,
      missions,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
