import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { getAvatarForBot } from '@/lib/bot-avatars';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { agent_id, avatar } = body;

    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id is required' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agentResult = await turso.execute({
      sql: 'SELECT id, name, metadata FROM agents WHERE id = ?',
      args: [agent_id],
    });

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Use provided avatar or generate one
    const finalAvatar = avatar || getAvatarForBot(String(agentResult.rows[0].name || 'Unknown'));

    // Get current metadata and update
    const metadataValue = agentResult.rows[0].metadata;
    const currentMetadata = metadataValue && typeof metadataValue === 'string'
      ? JSON.parse(metadataValue)
      : (metadataValue || {});

    currentMetadata.avatar = finalAvatar;
    currentMetadata.avatar_updated_at = new Date().toISOString();

    // Update agent metadata
    await turso.execute({
      sql: 'UPDATE agents SET metadata = ?, updated_at = ? WHERE id = ?',
      args: [JSON.stringify(currentMetadata), new Date().toISOString(), agent_id],
    });

    return NextResponse.json({
      success: true,
      agent_id,
      avatar: finalAvatar,
      message: 'Avatar updated successfully',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
