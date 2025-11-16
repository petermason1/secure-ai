import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create SEO Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%SEO%' OR name LIKE '%seo%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [departmentId, 'SEO Department', 'Search Engine Optimization - Technical, Content, Link Building, Analytics, Competitor Intelligence, and Local SEO'],
      });
    }

    // Create 6 SEO bots
    const bots = [
      {
        name: 'Technical SEO Bot',
        capabilities: ['site_audit', 'schema_markup', 'crawlability', 'site_speed', 'mobile_optimization', 'technical_issues'],
        icon: '⚙️',
      },
      {
        name: 'Content SEO Bot',
        capabilities: ['keyword_research', 'content_optimization', 'on_page_seo', 'title_meta_optimization', 'content_gap_analysis'],
        icon: '📝',
      },
      {
        name: 'Link Building Bot',
        capabilities: ['backlink_analysis', 'outreach', 'broken_link_building', 'guest_posting', 'relationship_building'],
        icon: '🔗',
      },
      {
        name: 'Analytics & Rankings Bot',
        capabilities: ['rankings_tracking', 'traffic_analysis', 'conversion_tracking', 'serp_monitoring', 'performance_reporting'],
        icon: '📊',
      },
      {
        name: 'Competitor Intelligence Bot',
        capabilities: ['competitor_analysis', 'keyword_gap_analysis', 'backlink_profiles', 'content_opportunities', 'ranking_comparisons'],
        icon: '🔍',
      },
      {
        name: 'Local SEO Bot',
        capabilities: ['google_business_profile', 'local_citations', 'nap_consistency', 'local_keywords', 'review_management'],
        icon: '📍',
      },
    ];

    const createdBots = [];

    for (const bot of bots) {
      const agentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
        args: [
          agentId,
          departmentId,
          bot.name,
          JSON.stringify(bot.capabilities),
          JSON.stringify({ icon: bot.icon, department: 'SEO' }),
        ],
      });
      createdBots.push({ id: agentId, name: bot.name, icon: bot.icon });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'SEO Department',
      },
      bots: createdBots,
      message: 'SEO Department created with 6 specialized bots',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create SEO Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

