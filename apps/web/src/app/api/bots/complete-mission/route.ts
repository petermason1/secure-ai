import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { mission_id, progress, status } = body;

    if (!mission_id) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const finalStatus = status || 'completed';
    const finalProgress = progress !== undefined ? progress : 100;

    await turso.execute({
      sql: `UPDATE bot_missions 
            SET status = ?, progress = ?, completed_at = ?
            WHERE id = ?`,
      args: [finalStatus, finalProgress, finalStatus === 'completed' ? now : null, mission_id],
    });

    return NextResponse.json({
      success: true,
      mission_id,
      status: finalStatus,
      progress: finalProgress,
      message: `Mission ${finalStatus}`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
