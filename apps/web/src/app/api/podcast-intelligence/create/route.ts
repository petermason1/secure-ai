import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { name, description, host, rss_feed_url, youtube_channel_id, website_url, thumbnail_url } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Podcast name is required' },
        { status: 400 }
      );
    }

    const podcastId = randomUUID();

    await turso.execute({
      sql: `INSERT INTO podcasts (id, name, description, host, rss_feed_url, youtube_channel_id, website_url, thumbnail_url, status, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
      args: [podcastId, name, description || null, host || null, rss_feed_url || null, youtube_channel_id || null, website_url || null, thumbnail_url || null],
    });

    // Create a Podcast Intelligence Bot agent
    const agentId = randomUUID();
    const departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%podcast%' OR name LIKE '%intelligence%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      // Create Podcast Intelligence Department
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [departmentId, 'Podcast Intelligence', 'AI-powered podcast analysis and trend extraction',],
      });
    }

    await turso.execute({
      sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
            VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
      args: [
        agentId,
        departmentId,
        `Podcast Intelligence Bot - ${name}`,
        JSON.stringify(['transcribe', 'analyze', 'extract_insights', 'identify_trends', 'extract_expert_opinions', 'generate_business_ideas']),
        JSON.stringify({ podcast_id: podcastId, icon: '🎙️' }),
      ],
    });

    return NextResponse.json({
      success: true,
      podcast: {
        id: podcastId,
        name,
        description,
        host,
        rss_feed_url,
        youtube_channel_id,
        website_url,
        thumbnail_url,
      },
      agent: {
        id: agentId,
        name: `Podcast Intelligence Bot - ${name}`,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create podcast', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

