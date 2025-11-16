import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI-powered code autocomplete
 * Similar to Cursor's autocomplete feature
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { file_id, prefix_text, suffix_text, language, line_number, character_position } = body;

    if (!file_id || !prefix_text) {
      return NextResponse.json(
        { error: 'file_id and prefix_text are required' },
        { status: 400 }
      );
    }

    // Get file content for context
    const fileResult = await turso.execute({
      sql: `SELECT * FROM code_files WHERE id = ?`,
      args: [file_id],
    });

    if (fileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file = fileResult.rows[0];
    const rawFileContent = file.file_content;
    const fileContent = typeof rawFileContent === 'string'
      ? rawFileContent
      : rawFileContent instanceof ArrayBuffer
        ? Buffer.from(rawFileContent).toString('utf-8')
        : rawFileContent !== undefined && rawFileContent !== null
          ? String(rawFileContent)
          : '';

    // Get Code Completion Bot
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Code Completion%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Use AI for intelligent code completion
    const completionPrompt = `You are an AI code completion assistant (like Cursor). Provide intelligent code completion.

Language: ${language || file.language || 'unknown'}
Context (last 50 lines before cursor):
${fileContent.split('\n').slice(Math.max(0, (line_number || 0) - 50), line_number || 0).join('\n')}

Code before cursor (prefix):
${prefix_text}

Code after cursor (suffix):
${suffix_text || ''}

Provide the most likely code completion. Return ONLY the completion text, nothing else. Be concise and accurate.`;

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code completion assistant. Provide accurate, context-aware code completions. Return only the completion text.',
        },
        { role: 'user', content: completionPrompt },
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const completionTime = Date.now() - startTime;
    const completionText = completion.choices[0].message.content?.trim() || '';

    // Save completion to history
    const completionId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO code_completions (id, file_id, completion_text, prefix_text, language, completion_time_ms, generated_by_agent_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        completionId,
        file_id,
        completionText,
        prefix_text.substring(Math.max(0, prefix_text.length - 100)),
        language || file.language,
        completionTime,
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      completion: completionText,
      completion_id: completionId,
      language: language || file.language,
      response_time_ms: completionTime,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to generate autocomplete', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

