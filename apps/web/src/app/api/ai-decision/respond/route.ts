import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { decision_id, answer } = body;

    if (!decision_id || !answer) {
      return NextResponse.json(
        { error: 'decision_id and answer are required' },
        { status: 400 }
      );
    }

    // Get the decision
    const { data: decision, error: fetchError } = await supabase
      .from('ai_decisions')
      .select('*')
      .eq('id', decision_id)
      .single();

    if (fetchError || !decision) {
      return NextResponse.json(
        { error: 'Decision not found' },
        { status: 404 }
      );
    }

    // Update decision status
    const { error: updateError } = await supabase
      .from('ai_decisions')
      .update({
        status: answer === 'defer' ? 'deferred' : 'responded',
        user_response: answer,
        responded_at: new Date().toISOString()
      })
      .eq('id', decision_id);

    if (updateError) {
      console.error('Failed to update decision:', updateError);
      return NextResponse.json(
        { error: 'Failed to update decision' },
        { status: 500 }
      );
    }

    // Execute action if yes
    if (answer === 'yes') {
      await executeAction(decision);
    }

    return NextResponse.json({
      success: true,
      executed: answer === 'yes',
      message: answer === 'yes' 
        ? `Executing: ${decision.action_if_yes}` 
        : answer === 'no'
        ? 'Action cancelled'
        : 'Decision deferred'
    });

  } catch (error) {
    console.error('Decision response error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function executeAction(decision: any) {
  // Parse action and execute
  const action = JSON.parse(decision.action_if_yes);

  switch (action.type) {
    case 'create_email_campaign':
      await createEmailCampaign(action.params);
      break;
    case 'send_outreach':
      await sendOutreach(action.params);
      break;
    case 'create_promotion':
      await createPromotion(action.params);
      break;
    case 'schedule_post':
      await schedulePost(action.params);
      break;
    default:
      console.log('Unknown action type:', action.type);
  }
}

async function createEmailCampaign(params: any) {
  const { error } = await supabase
    .from('email_campaigns')
    .insert({
      client_id: params.client_id,
      name: params.name,
      subject_line: params.subject_line,
      content: params.content,
      target_segment: params.target_segment,
      status: 'scheduled',
      scheduled_for: params.scheduled_for
    });

  if (error) {
    console.error('Failed to create campaign:', error);
  }
}

async function sendOutreach(params: any) {
  // Trigger outreach agent
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/social-agent/partnerships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
}

async function createPromotion(params: any) {
  const { error } = await supabase
    .from('promotions')
    .insert({
      client_id: params.client_id,
      name: params.name,
      promo_type: params.promo_type,
      description: params.description,
      discount_amount: params.discount_amount,
      valid_from: params.valid_from,
      valid_until: params.valid_until,
      promo_code: params.promo_code,
      status: 'active'
    });

  if (error) {
    console.error('Failed to create promotion:', error);
  }
}

async function schedulePost(params: any) {
  const { error } = await supabase
    .from('social_posts')
    .update({
      status: 'scheduled',
      scheduled_for: params.scheduled_for
    })
    .eq('id', params.post_id);

  if (error) {
    console.error('Failed to schedule post:', error);
  }
}
