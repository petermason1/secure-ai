import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    
    // Get "since" timestamp from query params
    const { searchParams } = new URL(request.url);
    const sinceTimestamp = searchParams.get('since');

    // Get all junior dev team agents with their latest activity
    const agentsResult = await turso.execute({
      sql: `SELECT a.id, a.name, a.status, a.capabilities, a.config, a.metadata, a.created_at
            FROM agents a
            WHERE a.department_id = 'junior-dev-team'
            ORDER BY a.name`,
    });

    // Build tasks query with optional "since" filter
    let tasksQuery = `SELECT agent_id, action, resource_id, details, created_at
            FROM audit_logs
            WHERE department_id = 'junior-dev-team' AND action = 'task_assigned'`;
    const tasksArgs: any[] = [];
    
    if (sinceTimestamp) {
      tasksQuery += ` AND created_at > ?`;
      tasksArgs.push(sinceTimestamp);
    }
    
    tasksQuery += ` ORDER BY created_at DESC LIMIT 50`;
    
    const tasksResult = await turso.execute({
      sql: tasksQuery,
      args: tasksArgs,
    });

    // Build messages query with optional "since" filter
    let messagesQuery = `SELECT from_agent_id, to_agent_id, message_type, content, status, created_at
            FROM agent_messages
            WHERE (from_agent_id IN (
              SELECT id FROM agents WHERE department_id = 'junior-dev-team'
            ) OR to_agent_id IN (
              SELECT id FROM agents WHERE department_id = 'junior-dev-team'
            ))`;
    const messagesArgs: any[] = [];
    
    if (sinceTimestamp) {
      messagesQuery += ` AND created_at > ?`;
      messagesArgs.push(sinceTimestamp);
    }
    
    messagesQuery += ` ORDER BY created_at DESC LIMIT 20`;
    
    const messagesResult = await turso.execute({
      sql: messagesQuery,
      args: messagesArgs,
    });

    const agents = agentsResult.rows.map((row: any) => {
      const capabilities = JSON.parse(String(row.capabilities || '[]'));
      const metadata = JSON.parse(String(String(row.metadata || '{}')));
      
      // Find latest task for this agent
      const agentTasks = tasksResult.rows.filter((task: any) => task.agent_id === row.id);
      const latestTask = agentTasks[0] ? JSON.parse(String(String(String(agentTasks[0].details || '{}')))) : null;
      
      // Count messages from/to this agent
      const agentMessages = messagesResult.rows.filter((msg: any) => 
        msg.from_agent_id === row.id || msg.to_agent_id === row.id
      );

      return {
        id: row.id,
        name: row.name,
        status: row.status,
        capabilities,
        specialty: metadata.specialty || null,
        latest_task: latestTask ? {
          type: latestTask.task_type,
          description: latestTask.description,
          priority: latestTask.priority,
          assigned_at: agentTasks[0]?.created_at,
        } : null,
        message_count: agentMessages.length,
        created_at: row.created_at,
      };
    });

    // Get activity stats
    const stats = {
      total_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      total_tasks: tasksResult.rows.length,
      recent_messages: messagesResult.rows.length,
      new_since_last_check: sinceTimestamp ? {
        new_tasks: tasksResult.rows.length,
        new_messages: messagesResult.rows.length,
      } : null,
    };

    return NextResponse.json({
      success: true,
      stats,
      agents,
      recent_activity: {
        tasks: tasksResult.rows.map((row: any) => {
          const details = JSON.parse(String(String(row.details || '{}')));
          return {
            agent_id: row.agent_id,
            task_type: details.task_type,
            description: details.description,
            priority: details.priority,
            created_at: row.created_at,
          };
        }),
        messages: messagesResult.rows.map((row: any) => ({
          from: row.from_agent_id,
          to: row.to_agent_id,
          type: row.message_type,
          status: row.status,
          created_at: row.created_at,
        })),
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
