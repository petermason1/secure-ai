import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { advisory_id, status, notes } = await request.json();

    if (!advisory_id || !status) {
      return NextResponse.json(
        { error: 'advisory_id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'answered', 'escalated', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    let sql = `UPDATE security_advisories SET status = ?, updated_at = ?`;
    const args: any[] = [status, now];

    if (status === 'resolved') {
      sql += `, resolved_at = ?`;
      args.push(now);
    }

    if (notes) {
      sql += `, metadata = json_set(metadata, '$.notes', ?)`;
      args.push(notes);
    }

    sql += ` WHERE id = ?`;
    args.push(advisory_id);

    await turso.execute({ sql, args });

    // Log to audit log
    await turso.execute({
      sql: `INSERT INTO security_audit_log 
            (id, action_type, resource_type, resource_id, action_description, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'advisory_status_updated',
        'security_advisory',
        advisory_id,
        `Advisory status updated to ${status}`,
        JSON.stringify({ status, notes }),
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      advisory_id,
      status,
      updated_at: now,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}


