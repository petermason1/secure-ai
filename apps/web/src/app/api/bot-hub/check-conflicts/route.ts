import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { agent_id, action, context } = body;

    if (!agent_id || !action) {
      return NextResponse.json(
        { error: 'agent_id and action are required' },
        { status: 400 }
      );
    }

    // Get all active agents
    const { data: agents } = await supabase
      .from('agent_registry')
      .select('agent_id, agent_name, status')
      .neq('agent_id', agent_id)
      .eq('status', 'busy');

    // Get recent messages from other agents
    const { data: recentMessages } = await supabase
      .from('agent_messages')
      .select('*')
      .neq('from_agent_id', agent_id)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })
      .limit(20);

    const conflicts: any[] = [];

    // Check for priority conflicts
    if (context?.urgency === 'high') {
      const highPriorityMessages = recentMessages?.filter((msg: any) => 
        msg.priority === 'high' || msg.priority === 'urgent'
      );

      if (highPriorityMessages && highPriorityMessages.length > 0) {
        conflicts.push({
          type: 'priority',
          with_agent: highPriorityMessages[0].from_agent_id,
          description: 'Multiple high-priority actions detected',
          severity: 'medium',
        });
      }
    }

    // Check for resource conflicts (simplified)
    if (context?.resource) {
      const resourceMessages = recentMessages?.filter((msg: any) => {
        const msgContent = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        return msgContent.resource === context.resource;
      });

      if (resourceMessages && resourceMessages.length > 0) {
        conflicts.push({
          type: 'resource',
          with_agent: resourceMessages[0].from_agent_id,
          description: `Resource conflict: ${context.resource} already in use`,
          severity: 'high',
        });
      }
    }

    // Log conflict if found
    if (conflicts.length > 0) {
      await supabase
        .from('conflict_log')
        .insert({
          conflict_type: conflicts[0].type,
          agents_involved: [agent_id, conflicts[0].with_agent],
          conflict_description: conflicts[0].description,
          severity: conflicts[0].severity,
          status: 'open',
        });
    }

    return NextResponse.json({
      conflicts_found: conflicts.length > 0,
      conflicts,
      recommendation: conflicts.length > 0
        ? 'Review conflicts before proceeding'
        : 'No conflicts detected',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

