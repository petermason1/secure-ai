import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Social Media Department
    const deptResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Social Media%' OR name LIKE '%social%media%' LIMIT 1`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Social Media Department not found. Please create it first.' },
        { status: 404 }
      );
    }

    const departmentId = deptResult.rows[0].id;

    // Check if Trend Intelligence Bot already exists
    const existingBot = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Trend Intelligence%' AND department_id = ?`,
      args: [departmentId],
    });

    if (existingBot.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Trend Intelligence Bot already exists',
        agent: {
          id: existingBot.rows[0].id,
          name: 'Trend Intelligence Bot',
        },
      });
    }

    // Create Trend Intelligence Bot
    const agentId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
            VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
      args: [
        agentId,
        departmentId,
        'Trend Intelligence Bot',
        JSON.stringify([
          'trend_analysis',
          'pattern_recognition',
          'cultural_relevance_analysis',
          'lifecycle_prediction',
          'organic_content_generation',
          'trend_prediction',
          'content_performance_analysis',
          'emotional_connection_mapping',
          'visibility_channel_optimization',
        ]),
        JSON.stringify({
          icon: '📈',
          department: 'Social Media',
          expertise: 'Trend Intelligence',
          method: 'pattern_based_organic_trending',
          uses_paid_ads: false,
          training_data: 'historical_trends',
          knowledge_base: [
            'Cultural relevance patterns',
            'Trend lifecycle stages',
            'Emotional connection drivers',
            'Visibility and adoption patterns',
            'Organic vs paid amplification',
            'Novelty and differentiation factors',
          ],
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Trend Intelligence Bot created - Expert in creating organic trending content without paid advertising',
      agent: {
        id: agentId,
        name: 'Trend Intelligence Bot',
        department: 'Social Media',
        capabilities: [
          'trend_analysis',
          'pattern_recognition',
          'cultural_relevance_analysis',
          'lifecycle_prediction',
          'organic_content_generation',
        ],
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Trend Intelligence Bot', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

