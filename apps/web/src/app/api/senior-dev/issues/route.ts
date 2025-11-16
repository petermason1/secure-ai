import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const review_id = searchParams.get('review_id');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT i.*, r.file_path 
               FROM senior_dev_issues i
               LEFT JOIN senior_dev_reviews r ON i.review_id = r.id
               WHERE 1=1`;
    const args: any[] = [];

    if (review_id) {
      sql += ` AND i.review_id = ?`;
      args.push(review_id);
    }

    if (severity) {
      sql += ` AND i.severity = ?`;
      args.push(severity);
    }

    if (status) {
      sql += ` AND i.status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY 
               CASE i.severity 
                 WHEN 'critical' THEN 1 
                 WHEN 'high' THEN 2 
                 WHEN 'medium' THEN 3 
                 WHEN 'low' THEN 4 
                 ELSE 5 
               END,
               i.created_at DESC
             LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const issues = result.rows.map((row: any) => ({
      id: row.id,
      review_id: row.review_id,
      file_path: row.file_path,
      issue_type: row.issue_type,
      severity: row.severity,
      line_number: row.line_number,
      code_snippet: row.code_snippet,
      title: row.title,
      description: row.description,
      stack_overflow_reference: row.stack_overflow_reference,
      suggested_fix: row.suggested_fix,
      status: row.status,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to get issues' },
      { status: handled.code || 500 }
    );
  }
}

