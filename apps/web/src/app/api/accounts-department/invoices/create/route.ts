import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const {
      client_name,
      client_email,
      client_address,
      issue_date,
      due_date,
      currency = 'GBP',
      line_items = [],
      tax_rate = 0,
      discount_amount = 0,
      payment_terms,
      notes,
    } = body;

    if (!client_name || !line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: 'client_name and line_items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = line_items.reduce((sum: number, item: any) => {
      return sum + (item.quantity || 1) * (item.unit_price || 0);
    }, 0);

    const tax_amount = subtotal * (tax_rate / 100);
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get Invoice Manager Bot agent ID
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Invoice Manager%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    const invoiceId = randomUUID();

    await turso.execute({
      sql: `INSERT INTO accounts_invoices (id, invoice_number, client_name, client_email, client_address, issue_date, due_date, status, currency, subtotal, tax_rate, tax_amount, discount_amount, total_amount, payment_terms, notes, line_items, created_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        invoiceId,
        invoiceNumber,
        client_name,
        client_email || null,
        client_address || null,
        issue_date || new Date().toISOString().split('T')[0],
        due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        total_amount,
        payment_terms || null,
        notes || null,
        JSON.stringify(line_items),
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: {
        id: invoiceId,
        invoice_number: invoiceNumber,
        client_name,
        subtotal,
        tax_amount,
        total_amount,
        status: 'draft',
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create invoice', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

