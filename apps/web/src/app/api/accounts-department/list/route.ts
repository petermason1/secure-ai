import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get Accounts Department
    const deptResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.name LIKE '%Accounts%' OR d.name LIKE '%accounts%'
            GROUP BY d.id`,
    });

    if (deptResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        department: null,
        agents: [],
        stats: {
          invoices_total: 0,
          expenses_total: 0,
          payments_total: 0,
          outstanding_invoices: 0,
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

    // Get stats
    const invoicesResult = await turso.execute({
      sql: `SELECT COUNT(*) as count, SUM(total_amount) as total FROM accounts_invoices WHERE status != 'cancelled'`,
    });
    const expensesResult = await turso.execute({
      sql: `SELECT COUNT(*) as count, SUM(amount) as total FROM accounts_expenses WHERE status != 'rejected'`,
    });
    const paymentsResult = await turso.execute({
      sql: `SELECT COUNT(*) as count, SUM(amount) as total FROM accounts_payments WHERE status = 'completed'`,
    });
    const outstandingResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM accounts_invoices WHERE status IN ('sent', 'viewed', 'overdue')`,
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
      stats: {
        invoices_total: invoicesResult.rows[0]?.total || 0,
        expenses_total: expensesResult.rows[0]?.total || 0,
        payments_total: paymentsResult.rows[0]?.total || 0,
        outstanding_invoices: outstandingResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list Accounts Department' },
      { status: handled.code || 500 }
    );
  }
}

