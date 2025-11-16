import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

/**
 * Get token usage status for all bots
 * Calculates safe overnight token budgets
 */
export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get all active agents
    const agentsResult = await turso.execute({
      sql: `SELECT a.id, a.name, a.department_id, a.status, a.capabilities, a.config, a.metadata, d.name as department_name
            FROM agents a
            LEFT JOIN departments d ON a.department_id = d.id
            WHERE a.status = 'active'
            ORDER BY d.name, a.name`,
    });

    // Get token usage from bot_activity (if we track it)
    // For now, we'll calculate based on bot type and capabilities
    const now = new Date();
    const hoursUntilMorning = now.getHours() < 9 
      ? 9 - now.getHours() 
      : 24 - now.getHours() + 9; // Assume morning is 9am
    
    const overnightHours = hoursUntilMorning;
    const runsPerHour = 4; // Every 15 minutes = 4 runs/hour
    const totalRunsOvernight = overnightHours * runsPerHour;

    const bots = agentsResult.rows.map((row: any) => {
      const agentId = row.id;
      const name = row.name;
      const department = row.department_name || 'Unknown';
      const capabilities = JSON.parse(String(row.capabilities || '[]'));
      const config = JSON.parse(String(row.config || '{}'));
      const metadata = JSON.parse(String(row.metadata || '{}'));
      const isAutonomous = config.autonomous === true || metadata.autonomous === true;

      // Estimate tokens per run based on bot type
      let tokensPerRun = 1000; // Default
      let maxTokensPerRun = 5000;

      // Adjust based on department/capabilities
      if (name.includes('Blog') || name.includes('Writer')) {
        tokensPerRun = 3000; // Blog posts use more tokens
        maxTokensPerRun = 10000;
      } else if (name.includes('SEO') || name.includes('Analytics')) {
        tokensPerRun = 2000;
        maxTokensPerRun = 8000;
      } else if (name.includes('Code') || name.includes('Review')) {
        tokensPerRun = 2500;
        maxTokensPerRun = 10000;
      } else if (name.includes('Chat') || name.includes('Assistant')) {
        tokensPerRun = 1500;
        maxTokensPerRun = 6000;
      } else if (capabilities.includes('code_generation') || capabilities.includes('content_generation')) {
        tokensPerRun = 2000;
        maxTokensPerRun = 8000;
      }

      // Calculate safe overnight budget
      // Use 70% of max to be safe
      const safeTokensPerRun = Math.floor(tokensPerRun * 0.7);
      const safeOvernightBudget = safeTokensPerRun * totalRunsOvernight;
      const maxOvernightBudget = maxTokensPerRun * totalRunsOvernight;

      // Get recent activity count (last 24 hours)
      // This would require a token_usage table, for now we'll estimate
      const estimatedDailyUsage = tokensPerRun * (runsPerHour * 24);

      return {
        id: agentId,
        name,
        department,
        status: row.status,
        is_autonomous: isAutonomous,
        capabilities,
        tokens_per_run: tokensPerRun,
        max_tokens_per_run: maxTokensPerRun,
        safe_tokens_per_run: safeTokensPerRun,
        runs_per_hour: isAutonomous ? runsPerHour : 0,
        overnight_hours: overnightHours,
        total_runs_overnight: isAutonomous ? totalRunsOvernight : 0,
        safe_overnight_budget: isAutonomous ? safeOvernightBudget : 0,
        max_overnight_budget: isAutonomous ? maxOvernightBudget : 0,
        estimated_daily_usage: isAutonomous ? estimatedDailyUsage : 0,
        icon: metadata.icon || '🤖',
      };
    });

    // Calculate totals
    const totalBots = bots.length;
    const activeAutonomousBots = bots.filter(b => b.is_autonomous).length;
    const totalSafeOvernightBudget = bots.reduce((sum, b) => sum + b.safe_overnight_budget, 0);
    const totalMaxOvernightBudget = bots.reduce((sum, b) => sum + b.max_overnight_budget, 0);
    const totalEstimatedDailyUsage = bots.reduce((sum, b) => sum + b.estimated_daily_usage, 0);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      overnight_hours: overnightHours,
      runs_per_hour: runsPerHour,
      summary: {
        total_bots: totalBots,
        active_autonomous_bots: activeAutonomousBots,
        total_safe_overnight_budget: totalSafeOvernightBudget,
        total_max_overnight_budget: totalMaxOvernightBudget,
        total_estimated_daily_usage: totalEstimatedDailyUsage,
      },
      bots,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get token status', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

