import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

/**
 * Ingest YouTube video transcript
 * This endpoint accepts a YouTube video URL or video ID and attempts to extract the transcript
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { podcast_id, youtube_video_id, youtube_url } = body;

    if (!podcast_id) {
      return NextResponse.json(
        { error: 'podcast_id is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL if provided
    let videoId = youtube_video_id;
    if (youtube_url && !videoId) {
      const match = youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      videoId = match ? match[1] : null;
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'youtube_video_id or valid youtube_url is required' },
        { status: 400 }
      );
    }

    // Create ingestion job
    const jobId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO podcast_ingestion_jobs (id, podcast_id, job_type, status, source_url, parameters, created_at)
            VALUES (?, ?, 'transcribe', 'pending', ?, ?, datetime('now'))`,
      args: [
        jobId,
        podcast_id,
        `https://www.youtube.com/watch?v=${videoId}`,
        JSON.stringify({ youtube_video_id: videoId, method: 'youtube_transcript' }),
      ],
    });

    // Note: Actual YouTube transcript extraction would require:
    // 1. youtube-transcript library or YouTube Data API
    // 2. Or using a service like Happy Scribe API
    // For now, we'll return a job ID and instructions

    return NextResponse.json({
      success: true,
      message: 'Ingestion job created. YouTube transcript extraction requires additional setup.',
      job_id: jobId,
      video_id: videoId,
      instructions: [
        'Install: npm install youtube-transcript',
        'Or use YouTube Data API v3 with captions.list',
        'Or integrate with Happy Scribe API',
        'Update this endpoint to actually fetch transcripts',
      ],
      note: 'This is a placeholder - implement actual YouTube transcript fetching based on your preferred method',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create ingestion job', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

