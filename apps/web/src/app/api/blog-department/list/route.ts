import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get Blog Department
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%Blog%' OR d.name LIKE '%blog%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agents: [],
        posts: [],
        stats: {
          total_posts: 0,
          published_posts: 0,
          draft_posts: 0,
        },
      });
    }

    const dept = deptResult.rows[0];

    // Get agents
    const agentsResult = await turso.execute({
      sql: `SELECT * FROM agents WHERE department_id = ? ORDER BY name`,
      args: [dept.id],
    });

    const agents = agentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
    }));

    // Get blog posts
    const postsResult = await turso.execute({
      sql: `SELECT * FROM blog_posts WHERE status = ? ORDER BY published_at DESC, created_at DESC LIMIT ?`,
      args: [status, limit],
    });

    const posts = postsResult.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      author: row.author,
      status: row.status,
      published_at: row.published_at,
      read_time_minutes: row.read_time_minutes,
      tags: JSON.parse(String(row.tags || '[]')),
      views_count: row.views_count,
      likes_count: row.likes_count,
      created_at: row.created_at,
    }));

    // Get stats
    const statsResult = await turso.execute({
      sql: `SELECT 
              COUNT(*) as total_posts,
              SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_posts,
              SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_posts
            FROM blog_posts`,
    });

    return NextResponse.json({
      success: true,
      department: {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        status: dept.status,
      },
      agents,
      posts,
      stats: {
        total_posts: statsResult.rows[0]?.total_posts || 0,
        published_posts: statsResult.rows[0]?.published_posts || 0,
        draft_posts: statsResult.rows[0]?.draft_posts || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Blog Department' },
      { status: handled.code || 500 }
    );
  }
}

