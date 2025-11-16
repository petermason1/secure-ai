import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';

    let sql = `SELECT * FROM security_best_practices WHERE status = ?`;
    const args: any[] = [status];

    if (category) {
      sql += ` AND category = ?`;
      args.push(category);
    }

    sql += ` ORDER BY priority DESC, created_at DESC`;

    const result = await turso.execute({ sql, args });

    const practices = result.rows.map((row: any) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      content: row.content,
      do_items: JSON.parse(String(row.do_items || '[]')),
      dont_items: JSON.parse(String(row.dont_items || '[]')),
      checklist_items: JSON.parse(String(row.checklist_items || '[]')),
      priority: row.priority,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: practices.length,
      practices,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


