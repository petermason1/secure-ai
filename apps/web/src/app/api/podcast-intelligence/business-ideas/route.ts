import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const episode_id = searchParams.get('episode_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM podcast_business_ideas WHERE 1=1`;
    const args: any[] = [];

    if (episode_id) {
      sql += ` AND episode_id = ?`;
      args.push(episode_id);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const ideas = result.rows.map((row: any) => ({
      id: row.id,
      episode_id: row.episode_id,
      idea_title: row.idea_title,
      idea_description: row.idea_description,
      market_category: row.market_category,
      potential_value: row.potential_value,
      mentioned_by: row.mentioned_by,
      related_trends: JSON.parse(String(row.related_trends || '[]')),
      linked_to_project_id: row.linked_to_project_id,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: ideas.length,
      ideas,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get business ideas' },
      { status: handled.code || 500 }
    );
  }
}

