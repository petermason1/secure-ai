import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe podcast episode
 * Accepts either:
 * 1. episode_id + transcript_text (manual upload)
 * 2. episode_id + audio_url (transcribe with Whisper)
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { episode_id, transcript_text, audio_url } = body;

    if (!episode_id) {
      return NextResponse.json(
        { error: 'episode_id is required' },
        { status: 400 }
      );
    }

    // Get episode
    const episodeResult = await turso.execute({
      sql: `SELECT * FROM podcast_episodes WHERE id = ?`,
      args: [episode_id],
    });

    if (episodeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    const episode = episodeResult.rows[0];
    let finalTranscript = transcript_text;

    // If audio_url provided, transcribe with Whisper
    if (audio_url && !transcript_text) {
      try {
        // Note: This requires the audio file to be accessible via URL
        // For local files, you'd need to upload to a temporary storage first
        const transcription = await openai.audio.transcriptions.create({
          file: await fetch(audio_url).then(r => r.blob()) as any,
          model: 'whisper-1',
          language: 'en',
        });
        finalTranscript = transcription.text;
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Failed to transcribe audio', details: error.message },
          { status: 500 }
        );
      }
    }

    if (!finalTranscript) {
      return NextResponse.json(
        { error: 'transcript_text or audio_url is required' },
        { status: 400 }
      );
    }

    // Get agent ID
    const agentResult = await turso.execute({
      sql: `SELECT a.id FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE d.name LIKE '%podcast%' OR d.name LIKE '%intelligence%'
            LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Check if transcript already exists
    const existingResult = await turso.execute({
      sql: `SELECT id FROM podcast_transcripts WHERE episode_id = ?`,
      args: [episode_id],
    });

    const wordCount = finalTranscript.split(/\s+/).length;
    const transcriptId = existingResult.rows[0]?.id || randomUUID();

    if (existingResult.rows.length > 0) {
      // Update existing
      await turso.execute({
        sql: `UPDATE podcast_transcripts 
              SET transcript_text = ?, word_count = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [finalTranscript, wordCount, transcriptId],
      });
    } else {
      // Create new
      await turso.execute({
        sql: `INSERT INTO podcast_transcripts (id, episode_id, transcript_text, word_count, transcription_method, processed_by_agent_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [transcriptId, episode_id, finalTranscript, wordCount, transcript_text ? 'manual' : 'ai', agentId],
      });
    }

    // Update episode status
    await turso.execute({
      sql: `UPDATE podcast_episodes SET status = 'transcribed', updated_at = datetime('now') WHERE id = ?`,
      args: [episode_id],
    });

    return NextResponse.json({
      success: true,
      message: 'Transcript saved successfully',
      transcript_id: transcriptId,
      episode_id,
      word_count: wordCount,
      transcription_method: transcript_text ? 'manual' : 'ai',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to transcribe episode', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

