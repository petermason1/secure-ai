import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Chat for code assistance (like Cursor's chat)
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { project_id, session_id, message, code_context, file_references } = body;

    if (!project_id || !message) {
      return NextResponse.json(
        { error: 'project_id and message are required' },
        { status: 400 }
      );
    }

    // Get AI Chat Assistant
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%AI Chat Assistant%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Get conversation history
    const historyResult = await turso.execute({
      sql: `SELECT message_type, message_content, code_context 
            FROM ai_code_chat 
            WHERE session_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10`,
      args: [session_id || randomUUID()],
    });

    const history: ChatCompletionMessageParam[] = historyResult.rows
      .reverse()
      .map((row: any) => ({
        role: row.message_type === 'user' ? 'user' : 'assistant',
        content: row.message_content,
      }));

    // Build context
    let contextPrompt = `You are an AI coding assistant (like Cursor). Help with code questions, debugging, refactoring, and explanations.

User's question: ${message}`;

    if (code_context) {
      contextPrompt += `\n\nCode context:\n${code_context}`;
    }

    if (file_references && file_references.length > 0) {
      contextPrompt += `\n\nReferenced files: ${file_references.join(', ')}`;
    }

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert coding assistant. Provide clear, helpful answers about code, debugging, architecture, and best practices. Use code blocks when showing code.',
        },
        ...history,
        { role: 'user', content: contextPrompt },
      ],
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;
    const response = completion.choices[0].message.content || '';

    const finalSessionId = session_id || randomUUID();

    // Save user message
    const userMessageId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO ai_code_chat (id, project_id, session_id, message_type, message_content, code_context, file_references, responded_by_agent_id, created_at)
            VALUES (?, ?, ?, 'user', ?, ?, ?, ?, datetime('now'))`,
      args: [userMessageId, project_id, finalSessionId, message, code_context || null, JSON.stringify(file_references || []), agentId],
    });

    // Save assistant response
    const assistantMessageId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO ai_code_chat (id, project_id, session_id, message_type, message_content, response_time_ms, tokens_used, responded_by_agent_id, created_at)
            VALUES (?, ?, ?, 'assistant', ?, ?, ?, ?, datetime('now'))`,
      args: [
        assistantMessageId,
        project_id,
        finalSessionId,
        response,
        responseTime,
        completion.usage?.total_tokens || 0,
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      response,
      session_id: finalSessionId,
      response_time_ms: responseTime,
      tokens_used: completion.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get AI chat response', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

