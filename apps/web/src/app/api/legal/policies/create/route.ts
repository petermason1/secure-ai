import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const {
      policy_name,
      policy_type,
      content,
      status = 'review',
      version = 1,
      metadata = {},
    } = body;

    if (!policy_name || !policy_type || !content) {
      return NextResponse.json(
        { error: 'policy_name, policy_type, and content are required' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await turso.execute({
      sql: `INSERT INTO legal_policies
            (id, policy_name, policy_type, version, status, content, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        id,
        policy_name,
        policy_type,
        version,
        status,
        content,
        JSON.stringify(metadata),
      ],
    });

    return NextResponse.json({
      success: true,
      policy: {
        id,
        policy_name,
        policy_type,
        status,
        version,
        metadata,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create legal policy', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

