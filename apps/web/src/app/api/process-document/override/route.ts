/**
 * Big Technical Execution Engine - Tier 1: Invoice Processor
 * 
 * API Route: /app/api/process-document/override/route.ts
 * 
 * Handles manual override of routing status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id, routing_status } = body;

    if (!document_id || !routing_status) {
      return NextResponse.json(
        { error: 'document_id and routing_status are required' },
        { status: 400 }
      );
    }

    if (!['READY_FOR_AUTO_PAY', 'PENDING_MANAGER_REVIEW'].includes(routing_status)) {
      return NextResponse.json(
        { error: 'Invalid routing_status' },
        { status: 400 }
      );
    }

    // Update document routing status
    const { error } = await supabase
      .from('documents')
      .update({ routing_status })
      .eq('id', document_id);

    if (error) {
      throw error;
    }

    // Log the override
    await supabase.from('processing_logs').insert({
      document_id,
      stage: 'manual_override',
      status: 'success',
      routing_status,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      document_id,
      routing_status,
    });
  } catch (error) {
    console.error('Override error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update routing status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
