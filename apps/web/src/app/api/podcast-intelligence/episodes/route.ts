import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const podcast_id = searchParams.get('podcast_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT e.*, 
                      (SELECT COUNT(*) FROM podcast_transcripts WHERE episode_id = e.id) as has_transcript,
                      (SELECT COUNT(*) FROM podcast_insights WHERE episode_id = e.id) as insight_count
               FROM podcast_episodes e
               WHERE 1=1`;
    const args: any[] = [];

    if (podcast_id) {
      sql += ` AND e.podcast_id = ?`;
      args.push(podcast_id);
    }

    if (status) {
      sql += ` AND e.status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY e.published_date DESC, e.created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const episodes = result.rows.map((row: any) => ({
      id: row.id,
      podcast_id: row.podcast_id,
      episode_number: row.episode_number,
      title: row.title,
      description: row.description,
      guest_name: row.guest_name,
      guest_bio: row.guest_bio,
      published_date: row.published_date,
      duration_seconds: row.duration_seconds,
      audio_url: row.audio_url,
      video_url: row.video_url,
      transcript_url: row.transcript_url,
      transcript_source: row.transcript_source,
      status: row.status,
      has_transcript: row.has_transcript > 0,
      insight_count: row.insight_count || 0,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: episodes.length,
      episodes,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get episodes' },
      { status: handled.code || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { podcast_id, episode_number, title, description, guest_name, guest_bio, published_date, duration_seconds, audio_url, video_url, transcript_url, transcript_source } = body;

    if (!podcast_id || !title) {
      return NextResponse.json(
        { error: 'podcast_id and title are required' },
        { status: 400 }
      );
    }

    const episodeId = randomUUID();

    await turso.execute({
      sql: `INSERT INTO podcast_episodes (id, podcast_id, episode_number, title, description, guest_name, guest_bio, published_date, duration_seconds, audio_url, video_url, transcript_url, transcript_source, status, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '{}', datetime('now'), datetime('now'))`,
      args: [
        episodeId,
        podcast_id,
        episode_number || null,
        title,
        description || null,
        guest_name || null,
        guest_bio || null,
        published_date || null,
        duration_seconds || null,
        audio_url || null,
        video_url || null,
        transcript_url || null,
        transcript_source || null,
      ],
    });

    return NextResponse.json({
      success: true,
      episode: {
        id: episodeId,
        podcast_id,
        episode_number,
        title,
        description,
        guest_name,
        published_date,
        status: 'pending',
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create episode' },
      { status: handled.code || 500 }
    );
  }
}

