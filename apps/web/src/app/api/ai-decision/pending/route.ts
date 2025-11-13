import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get pending decisions for the user
    const { data: decisions, error } = await supabase
      .from('ai_decisions')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Failed to fetch decisions:', error);
      return NextResponse.json({ decisions: [] });
    }

    return NextResponse.json({
      decisions: decisions || [],
      count: decisions?.length || 0
    });

  } catch (error) {
    console.error('Decision fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
