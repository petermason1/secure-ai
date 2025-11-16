import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const result = await turso.execute({
      sql: `SELECT p.*, 
                   COUNT(DISTINCT e.id) as episode_count,
                   COUNT(DISTINCT t.id) as transcript_count
            FROM podcasts p
            LEFT JOIN podcast_episodes e ON p.id = e.podcast_id
            LEFT JOIN podcast_transcripts t ON e.id = t.episode_id
            WHERE p.status = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
      args: [status],
    });

    const podcasts = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      host: row.host,
      rss_feed_url: row.rss_feed_url,
      youtube_channel_id: row.youtube_channel_id,
      website_url: row.website_url,
      thumbnail_url: row.thumbnail_url,
      status: row.status,
      episode_count: row.episode_count || 0,
      transcript_count: row.transcript_count || 0,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: podcasts.length,
      podcasts,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list podcasts' },
      { status: handled.code || 500 }
    );
  }
}

