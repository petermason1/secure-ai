import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create Accounts Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Accounts%' OR name LIKE '%accounts%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [
          departmentId,
          'Accounts Department',
          'Financial management, invoicing, expenses, payments, reporting, tax, and compliance',
        ],
      });
    }

    // Create 6 Accounts bots
    const bots = [
      {
        name: 'Invoice Manager Bot',
        capabilities: ['create_invoices', 'send_invoices', 'track_payments', 'payment_reminders', 'invoice_templates'],
        icon: '📄',
      },
      {
        name: 'Expense Tracker Bot',
        capabilities: ['track_expenses', 'approve_expenses', 'categorize_expenses', 'receipt_processing', 'expense_reports'],
        icon: '💰',
      },
      {
        name: 'Payment Processor Bot',
        capabilities: ['process_payments', 'payment_reconciliation', 'payment_tracking', 'refund_processing'],
        icon: '💳',
      },
      {
        name: 'Financial Reporter Bot',
        capabilities: ['profit_loss_reports', 'balance_sheets', 'cash_flow_reports', 'financial_forecasting', 'kpi_tracking'],
        icon: '📊',
      },
      {
        name: 'Tax & Compliance Bot',
        capabilities: ['tax_calculations', 'vat_returns', 'tax_filing', 'compliance_monitoring', 'audit_preparation'],
        icon: '📋',
      },
      {
        name: 'Budget Manager Bot',
        capabilities: ['budget_planning', 'budget_tracking', 'budget_alerts', 'spend_analysis', 'budget_forecasting'],
        icon: '📈',
      },
    ];

    const createdBots = [];

    for (const bot of bots) {
      const agentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
        args: [
          agentId,
          departmentId,
          bot.name,
          JSON.stringify(bot.capabilities),
          JSON.stringify({ icon: bot.icon, department: 'Accounts' }),
        ],
      });
      createdBots.push({ id: agentId, name: bot.name, icon: bot.icon });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Accounts Department',
      },
      bots: createdBots,
      message: 'Accounts Department created with 6 specialized financial bots',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Accounts Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

