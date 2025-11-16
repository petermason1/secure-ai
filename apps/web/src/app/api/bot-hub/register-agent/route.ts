import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { agent_id, agent_name, department, capabilities } = body;

    if (!agent_id || !agent_name) {
      return NextResponse.json(
        { error: 'agent_id and agent_name are required' },
        { status: 400 }
      );
    }

    // Register agent
    const { data, error } = await supabase
      .from('agent_registry')
      .upsert({
        agent_id,
        agent_name,
        department: department || null,
        capabilities: capabilities || [],
        status: 'idle',
        last_activity: new Date().toISOString(),
        communication_preferences: {},
        dependencies: [],
      }, {
        onConflict: 'agent_id',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: data,
      message: 'Agent registered successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

