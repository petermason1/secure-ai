/**
 * Big Technical Execution Engine - Tier 2: Sales Automation Agent
 * 
 * API Route: /api/sales-agent/status
 * 
 * Status polling endpoint that uses Supabase get_job_status function
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');

    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    // Call Supabase function
    const { data, error } = await supabase.rpc('get_job_status', {
      p_job_id: jobId,
    });

    if (error) {
      console.error('Status function error:', error);
      return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Status route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
