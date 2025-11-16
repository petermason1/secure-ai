import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const {
      vendor_name,
      vendor_email,
      category,
      description,
      amount,
      currency = 'GBP',
      tax_amount = 0,
      receipt_url,
      expense_date,
      payment_method,
    } = body;

    if (!vendor_name || !category || !description || !amount) {
      return NextResponse.json(
        { error: 'vendor_name, category, description, and amount are required' },
        { status: 400 }
      );
    }

    // Generate expense number
    const expenseNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get Expense Tracker Bot agent ID
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Expense Tracker%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    const expenseId = randomUUID();

    await turso.execute({
      sql: `INSERT INTO accounts_expenses (id, expense_number, vendor_name, vendor_email, category, description, amount, currency, tax_amount, receipt_url, expense_date, payment_method, status, created_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))`,
      args: [
        expenseId,
        expenseNumber,
        vendor_name,
        vendor_email || null,
        category,
        description,
        amount,
        currency,
        tax_amount,
        receipt_url || null,
        expense_date || new Date().toISOString().split('T')[0],
        payment_method || null,
        agentId,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      expense: {
        id: expenseId,
        expense_number: expenseNumber,
        vendor_name,
        category,
        amount,
        status: 'pending',
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create expense', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

