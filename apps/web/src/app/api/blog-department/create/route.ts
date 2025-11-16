import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create Blog Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Blog%' OR name LIKE '%blog%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [
          departmentId,
          'Blog Department',
          'Autonomous daily blog post creation, content planning, SEO optimization, and analytics',
        ],
      });
    }

    // Create Blog Department bots
    const bots = [
      {
        name: 'Daily Blog Writer',
        capabilities: ['daily_blog_creation', 'content_generation', 'seo_optimization', 'trend_analysis'],
        icon: '✍️',
      },
      {
        name: 'Content Strategist',
        capabilities: ['content_planning', 'topic_research', 'calendar_management', 'audience_analysis'],
        icon: '📅',
      },
      {
        name: 'SEO Specialist',
        capabilities: ['keyword_research', 'seo_optimization', 'meta_tags', 'content_optimization'],
        icon: '🔍',
      },
      {
        name: 'Editor & Proofreader',
        capabilities: ['content_editing', 'proofreading', 'fact_checking', 'style_consistency'],
        icon: '✏️',
      },
      {
        name: 'Analytics Reporter',
        capabilities: ['analytics_tracking', 'performance_reporting', 'engagement_analysis', 'trend_identification'],
        icon: '📊',
      },
    ];

    const createdBots = [];

    for (const bot of bots) {
      // Check if bot exists
      const existingBot = await turso.execute({
        sql: `SELECT id FROM agents WHERE name = ? AND department_id = ?`,
        args: [bot.name, departmentId],
      });

      if (existingBot.rows.length > 0) {
        createdBots.push({ id: existingBot.rows[0].id, name: bot.name, icon: bot.icon, exists: true });
        continue;
      }

      const agentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
        args: [
          agentId,
          departmentId,
          bot.name,
          JSON.stringify(bot.capabilities),
          JSON.stringify({ icon: bot.icon, department: 'Blog Department', autonomous: true }),
        ],
      });
      createdBots.push({ id: agentId, name: bot.name, icon: bot.icon });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Blog Department',
      },
      bots: createdBots,
      message: 'Blog Department created with 5 autonomous bots for daily blog creation',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Blog Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

