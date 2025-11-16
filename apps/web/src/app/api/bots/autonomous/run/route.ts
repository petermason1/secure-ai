import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

/**
 * Autonomous Bot Runner - Runs on Vercel Cron (every 15 minutes)
 * This endpoint is called automatically by Vercel to run bots autonomously
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (not public)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Get all active agents that should run autonomously
    const agentsResult = await turso.execute({
      sql: `SELECT a.id, a.name, a.department_id, a.capabilities, a.config, a.metadata, d.name as department_name
            FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE a.status = 'active' 
            AND a.config LIKE '%"autonomous": true%'
            ORDER BY a.department_id, a.name`,
    });

    const agents = agentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      department_id: row.department_id,
      department_name: row.department_name,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      config: JSON.parse(String(row.config || '{}')),
      metadata: JSON.parse(String(row.metadata || '{}')),
    }));

    const results = [];

    // Run each autonomous bot
    for (const agent of agents) {
      try {
        // Route to appropriate handler based on department
        let taskResult = null;

        switch (agent.department_id) {
          case 'post-team':
            // Post team bots check for new messages
            taskResult = await runPostTeamBot(agent);
            break;
          case 'social-media':
            // Social media bots check for scheduled posts
            taskResult = await runSocialMediaBot(agent);
            break;
          case 'hr-department':
            // HR bots check for pending tasks
            taskResult = await runHRBot(agent);
            break;
          case 'legal-department':
            // Legal bots check for pending reviews
            taskResult = await runLegalBot(agent);
            break;
          case 'policy-department':
            // Policy bots check for pending audits
            taskResult = await runPolicyBot(agent);
            break;
          default:
            // Generic autonomous task
            taskResult = { status: 'skipped', reason: 'no_handler' };
        }

        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          department: agent.department_name,
          result: taskResult,
          timestamp: now,
        });
      } catch (error: any) {
        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          department: agent.department_name,
          result: { status: 'error', error: error.message },
          timestamp: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now,
      agents_processed: agents.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for different bot types
async function runPostTeamBot(agent: any) {
  const turso = getTursoClient();
  // Check for new messages that need processing
  const messagesResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM messages WHERE status = 'new'`,
  });
  const count = messagesResult.rows[0]?.count || 0;
  return { status: 'checked', new_messages: count };
}

async function runSocialMediaBot(agent: any) {
  const turso = getTursoClient();
  // Check for scheduled posts
  const postsResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM social_posts WHERE status = 'scheduled' AND scheduled_for <= datetime('now')`,
  });
  const count = postsResult.rows[0]?.count || 0;
  return { status: 'checked', scheduled_posts: count };
}

async function runHRBot(agent: any) {
  const turso = getTursoClient();
  // Check for pending onboarding tasks
  const onboardingResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM hr_onboarding WHERE status = 'pending'`,
  });
  const count = onboardingResult.rows[0]?.count || 0;
  return { status: 'checked', pending_tasks: count };
}

async function runLegalBot(agent: any) {
  const turso = getTursoClient();
  // Check for pending contract reviews
  const contractsResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM legal_contracts WHERE status = 'review'`,
  });
  const count = contractsResult.rows[0]?.count || 0;
  return { status: 'checked', pending_reviews: count };
}

async function runPolicyBot(agent: any) {
  const turso = getTursoClient();
  // Check for scheduled audits
  const auditsResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM policy_audits WHERE status = 'scheduled'`,
  });
  const count = auditsResult.rows[0]?.count || 0;
  return { status: 'checked', scheduled_audits: count };
}

