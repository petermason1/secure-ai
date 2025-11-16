import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const episode_id = searchParams.get('episode_id');
    const insight_type = searchParams.get('insight_type');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM podcast_insights WHERE 1=1`;
    const args: any[] = [];

    if (episode_id) {
      sql += ` AND episode_id = ?`;
      args.push(episode_id);
    }

    if (insight_type) {
      sql += ` AND insight_type = ?`;
      args.push(insight_type);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const insights = result.rows.map((row: any) => ({
      id: row.id,
      episode_id: row.episode_id,
      insight_type: row.insight_type,
      title: row.title,
      content: row.content,
      confidence_score: row.confidence_score,
      tags: JSON.parse(String(row.tags || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get insights' },
      { status: handled.code || 500 }
    );
  }
}

