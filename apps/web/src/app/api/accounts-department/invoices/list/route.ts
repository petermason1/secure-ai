import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `SELECT * FROM accounts_invoices WHERE 1=1`;
    const args: any[] = [];

    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);

    const result = await turso.execute({ sql, args });

    const invoices = result.rows.map((row: any) => ({
      id: row.id,
      invoice_number: row.invoice_number,
      client_name: row.client_name,
      client_email: row.client_email,
      issue_date: row.issue_date,
      due_date: row.due_date,
      status: row.status,
      currency: row.currency,
      subtotal: row.subtotal,
      tax_amount: row.tax_amount,
      discount_amount: row.discount_amount,
      total_amount: row.total_amount,
      paid_amount: row.paid_amount,
      line_items: JSON.parse(String(row.line_items || '[]')),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list invoices' },
      { status: handled.code || 500 }
    );
  }
}

