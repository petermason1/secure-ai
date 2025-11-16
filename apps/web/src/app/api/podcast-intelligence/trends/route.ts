import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM podcast_trends WHERE 1=1`;
    const args: any[] = [];

    if (category) {
      sql += ` AND category = ?`;
      args.push(category);
    }

    sql += ` ORDER BY mention_count DESC, created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const trends = result.rows.map((row: any) => ({
      id: row.id,
      trend_name: row.trend_name,
      description: row.description,
      category: row.category,
      first_mentioned_date: row.first_mentioned_date,
      mention_count: row.mention_count,
      sentiment: row.sentiment,
      related_episodes: JSON.parse(String(row.related_episodes || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: trends.length,
      trends,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get trends' },
      { status: handled.code || 500 }
    );
  }
}

