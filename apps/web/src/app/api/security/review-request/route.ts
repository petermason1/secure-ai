import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { review_type, title, description, resource_url, priority } = await request.json();

    if (!review_type || !title || !description) {
      return NextResponse.json(
        { error: 'review_type, title, and description are required' },
        { status: 400 }
      );
    }

    const reviewId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO security_review_requests 
            (id, review_type, title, description, resource_url, status, priority, requested_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reviewId,
        review_type,
        title,
        description,
        resource_url || null,
        'pending',
        priority || 'medium',
        'user', // TODO: Get from auth
        now,
        now,
      ],
    });

    // Log to audit log
    await turso.execute({
      sql: `INSERT INTO security_audit_log 
            (id, action_type, resource_type, resource_id, action_description, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'review_requested',
        'security_review',
        reviewId,
        `Review requested: ${title}`,
        JSON.stringify({ review_type, priority }),
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      status: 'pending',
      message: 'Review request submitted successfully',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM security_review_requests WHERE 1=1`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY priority DESC, created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const reviews = result.rows.map((row: any) => ({
      id: row.id,
      review_type: row.review_type,
      title: row.title,
      description: row.description,
      resource_url: row.resource_url,
      status: row.status,
      priority: row.priority,
      requested_by: row.requested_by,
      reviewed_by_agent_id: row.reviewed_by_agent_id,
      review_findings: row.review_findings,
      recommendations: row.recommendations,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
    }));

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


