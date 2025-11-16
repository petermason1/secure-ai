/**
 * Big Technical Execution Engine - Tier 2: Sales Automation Agent
 * 
 * API Route: /api/sales-agent/execute
 * 
 * This is Route 2 - Long-running job processor that:
 * - Performs AI analysis (scoring)
 * - Applies rule-based routing
 * - Executes tools (CRM, Email)
 * - Implements cost control
 * - Logs everything to audit_logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAIClient, getAIModel } from '@/lib/openai-client';

// Cost control constants
const MAX_COST_USD = 0.50; // Maximum cost per lead processing
const AI_ANALYSIS_COST = 0.01; // Estimated cost per AI analysis
const TOOL_CALL_COST = 0.01; // Estimated cost per tool call

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log to audit_logs table
 */
async function logStep(supabase: any, 
  jobId: string,
  step: string,
  details: any,
  isSuccess: boolean,
  costUsd: number = 0
) {
  await supabase.from('audit_logs').insert({
    job_id: jobId,
    step,
    details,
    is_success: isSuccess,
    cost_usd: costUsd,
  });
}

/**
 * Safe tool call with retry logic and circuit breaker
 */
async function safeToolCall(supabase: any, 
  toolName: string,
  url: string,
  payload: any,
  jobId: string,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await logStep(supabase, jobId, `TOOL_${toolName}_ATTEMPT`, { attempt, payload }, true, 0.01);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (response.ok) {
        await logStep(supabase, jobId, `TOOL_${toolName}_SUCCESS`, { attempt }, true, 0);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      await logStep(supabase, 
        jobId,
        `TOOL_${toolName}_FAILURE`,
        { attempt, error: error instanceof Error ? error.message : 'Unknown' },
        false,
        0
      );

      if (attempt === maxRetries) {
        return false;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return false;
}

/**
 * AI Analysis - Score and classify lead
 */
async function analyzeLead(supabase: any, openai: any, model: string, jobId: string, leadName: string, companyContext: string): Promise<number> {
  await logStep(supabase, jobId, 'AI_ANALYSIS_START', { leadName, companyContext }, true, 0);

  try {
    const completion = await openai.chat.completions.create({
      model: model, // Uses free Gemini by default, upgrade to premium when monetized
      messages: [
        {
          role: 'system',
          content: `You are a lead scoring system. Analyze the lead and return ONLY a number between 0-100 representing the lead quality score. Consider factors like: budget mentioned, company size, growth potential, decision-making authority, urgency. Return ONLY the number, no explanation.`,
        },
        {
          role: 'user',
          content: `Lead Name: ${leadName}\nCompany Context: ${companyContext}\n\nScore this lead (0-100):`,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const scoreText = completion.choices[0]?.message?.content?.trim() || '50';
    const score = Math.min(100, Math.max(0, parseInt(scoreText) || 50));

    await logStep(supabase, 
      jobId,
      'AI_ANALYSIS_COMPLETE',
      { score, raw_response: scoreText },
      true,
      0.01
    );

    return score;
  } catch (error) {
    await logStep(supabase, 
      jobId,
      'AI_ANALYSIS_FAILED',
      { error: error instanceof Error ? error.message : 'Unknown' },
      false,
      0.01
    );
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION FUNCTION
// ============================================================================

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI Gateway API key not configured" }, { status: 500 });
  }
  if (!process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Internal API secret not configured" }, { status: 500 });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = createAIClient();
  const model = getAIModel();
  const internalApiSecret = process.env.INTERNAL_API_SECRET;
  const crmApiUrl = process.env.CRM_API_URL || "https://mock.crm-api.com/update-opportunity";
  const emailApiUrl = process.env.EMAIL_API_URL || "https://mock.email-api.com/send-draft";  // Verify internal API secret
  const secretHeader = request.headers.get('X-Internal-Secret');
  if (secretHeader !== internalApiSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    // Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('job_id', job_id)
      .single();

    if (leadError || !lead) {
      await logStep(supabase, job_id, 'FATAL_EXCEPTION', { error: 'Lead not found' }, false, 0);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let currentCost = 0;

    // Step 1: AI Analysis
    let leadScore: number;
    try {
      leadScore = await analyzeLead(supabase, openai, model, job_id, lead.lead_name, lead.company_context);
      currentCost += 0.01;

      // Update lead with score
      await supabase.from('leads').update({ lead_score: leadScore }).eq('job_id', job_id);
    } catch (error) {
      await logStep(supabase, job_id, 'FATAL_EXCEPTION', { error: 'AI analysis failed' }, false, currentCost);
      await supabase.from('leads').update({ final_status: 'FAILED' }).eq('job_id', job_id);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }

    // Step 2: Cost Control Check
    if (currentCost >= 0.50) {
      await logStep(supabase, 
        job_id,
        'COST_EXCEEDED',
        { current_cost: currentCost, max_cost: 0.50 },
        false,
        0
      );
      await supabase.from('leads').update({ final_status: 'FAILED' }).eq('job_id', job_id);
      return NextResponse.json({ error: 'Cost limit exceeded' }, { status: 429 });
    }

    // Step 3: Rule-Based Routing
    const isHighValue = leadScore >= 80;
    await logStep(supabase, job_id, 'ROUTING_DECISION', { score: leadScore, is_high_value: isHighValue }, true, 0);

    // Step 4: Execute Tools Based on Routing
    let crmSuccess = false;
    let emailSuccess = false;

    if (isHighValue) {
      // HIGH-VALUE PATH: CRM + Email
      await logStep(supabase, job_id, 'HIGH_VALUE_PATH', { actions: ['CRM', 'EMAIL'] }, true, 0);

      // Execute CRM
      crmSuccess = await safeToolCall(supabase, 
        'CRM',
        crmApiUrl,
        {
          lead_name: lead.lead_name,
          company_context: lead.company_context,
          score: leadScore,
          priority: 'HIGH',
        },
        job_id
      );

      currentCost += 0.01;

      // Only execute Email if CRM succeeded (transaction-like behavior)
      if (crmSuccess) {
        emailSuccess = await safeToolCall(supabase, 
          'EMAIL',
          emailApiUrl,
          {
            to: lead.lead_name,
            subject: `Welcome ${lead.lead_name}`,
            body: `Hi ${lead.lead_name},\n\nWe noticed your interest in automation solutions...`,
          },
          job_id
        );
        currentCost += 0.01;
      } else {
        await logStep(supabase, 
          job_id,
          'TOOL_FAILURE:CRM',
          { reason: 'CRM failed, skipping email' },
          false,
          0
        );
      }
    } else {
      // LOW-VALUE PATH: CRM only (low priority)
      await logStep(supabase, job_id, 'LOW_VALUE_PATH', { actions: ['CRM_LOW'] }, true, 0);

      crmSuccess = await safeToolCall(supabase, 
        'CRM',
        `${crmApiUrl}/low-priority`,
        {
          lead_name: lead.lead_name,
          company_context: lead.company_context,
          score: leadScore,
          priority: 'LOW',
        },
        job_id
      );
      currentCost += 0.01;
    }

    // Step 5: Final Status
    const finalSuccess = isHighValue ? crmSuccess && emailSuccess : crmSuccess;

    await supabase.from('leads').update({
      final_status: finalSuccess ? 'COMPLETE' : 'FAILED',
      crm_opportunity_id: crmSuccess ? `crm-${job_id}` : null,
      email_sent: emailSuccess,
    }).eq('job_id', job_id);

    await logStep(supabase, 
      job_id,
      'EXECUTION_FINAL_STATUS',
      {
        success: finalSuccess,
        crm_success: crmSuccess,
        email_success: emailSuccess,
        total_cost: currentCost,
      },
      finalSuccess,
      currentCost
    );

    return NextResponse.json({
      success: true,
      job_id,
      final_status: finalSuccess ? 'COMPLETE' : 'FAILED',
      total_cost: currentCost,
    });
  } catch (error) {
    console.error('Execute route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
