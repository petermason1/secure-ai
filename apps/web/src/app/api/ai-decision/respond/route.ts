import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Lazy-load client inside handler
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const body = await request.json();
    const { decision_id, answer } = body;

    if (!decision_id || !answer) {
      return NextResponse.json({ error: 'decision_id and answer are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ai_decisions')
      .update({ answer, status: 'RESOLVED', resolved_at: new Date().toISOString() })
      .eq('id', decision_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
