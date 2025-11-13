/**
 * Big Technical Execution Engine - Tier 2: Sales Automation Agent
 * 
 * API Route: /api/sales-agent/trigger
 * 
 * This is Route 1 - Fast trigger endpoint that:
 * - Accepts lead input
 * - Creates job_id
 * - Stores lead in database
 * - Triggers async job (Route 2)
 * - Returns immediately (< 500ms)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, createCipheriv } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const internalApiSecret = process.env.INTERNAL_API_SECRET!;
const piiEncryptionKey = process.env.PII_ENCRYPTION_KEY || '';

function encryptPII(plain: string) {
  if (!piiEncryptionKey || piiEncryptionKey.length < 32) {
    return { cipher: plain, iv: '', tag: '', algo: 'plain' };
  }
  const key = Buffer.from(piiEncryptionKey.slice(0, 32));
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algo: 'aes-256-gcm',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { lead_name, company_context } = body;

    // Validate input
    if (!lead_name || !company_context) {
      return NextResponse.json(
        { error: 'lead_name and company_context are required' },
        { status: 400 }
      );
    }

    // Generate unique job_id
    const jobId = `job-${Date.now()}-${randomBytes(8).toString('hex')}`;

    // Encrypt PII and store in pii_vault, returning token id
    const piiToken = `tok-${Date.now()}-${randomBytes(6).toString('hex')}`;
    const enc = encryptPII(String(lead_name).trim());
    await supabase.from('pii_vault').insert({
      token_id: piiToken,
      field: 'lead_name',
      cipher_text: enc.cipher,
      iv: enc.iv,
      tag: enc.tag,
      algo: enc.algo,
      created_at: new Date().toISOString(),
    });

    // Store lead with redacted name and token
    const { error: dbError } = await supabase.from('leads').insert({
      job_id: jobId,
      lead_name: '[REDACTED]',
      pii_token: piiToken,
      company_context: String(company_context).trim().slice(0, 255),
      final_status: 'PENDING',
    });

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create lead record' },
        { status: 500 }
      );
    }

    // Log initial trigger (no raw PII)
    await supabase.from('audit_logs').insert({
      job_id: jobId,
      step: 'JOB_TRIGGERED',
      details: { pii_token: piiToken, company_context: String(company_context).slice(0, 80) },
      is_success: true,
      cost_usd: 0,
    });

    // Trigger async job (Route 2) - fire and forget
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sales-agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internalApiSecret}`,
      },
      body: JSON.stringify({ job_id: jobId, pii_token: piiToken }),
    }).catch((err) => {
      console.error('Failed to trigger async job:', err);
      supabase.from('audit_logs').insert({
        job_id: jobId,
        step: 'FATAL_EXCEPTION',
        details: { error: 'Failed to trigger async job' },
        is_success: false,
        cost_usd: 0,
      });
    });

    // Return immediately (don't wait for async job)
    return NextResponse.json({
      success: true,
      job_id: jobId,
      message: 'Job triggered successfully',
    });
  } catch (error) {
    console.error('Trigger route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
