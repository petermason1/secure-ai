import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create Value Optimization Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Value Optimization%' OR name LIKE '%value%optimization%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [
          departmentId,
          'Value Optimization',
          'Actions that can add £1M+ in company value instantly: profit adjustments, margin improvements, IP protection, Tier 1 relationships, PR wins, financial audits',
        ],
      });
    }

    // Create Value Optimization Bot
    const agentId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
            VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
      args: [
        agentId,
        departmentId,
        'Value Optimization Bot',
        JSON.stringify([
          'profit_adjustment_analysis',
          'margin_improvement_planning',
          'ip_protection_strategy',
          'tier1_relationship_building',
          'pr_media_strategy',
          'financial_audit_coordination',
          'value_impact_tracking',
          'valuation_optimization',
        ]),
        JSON.stringify({
          icon: '💎',
          department: 'Value Optimization',
          expertise: 'Instant Value Creation',
          value_target: '£1M+',
          focus_areas: [
            'Profit adjustments',
            'Gross margin improvements',
            'Revenue growth demonstration',
            'IP protection',
            'Financial audits',
            'Tier 1 customers/investors',
            'PR & media wins',
            'Strategic partnerships',
          ],
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Value Optimization',
      },
      agent: {
        id: agentId,
        name: 'Value Optimization Bot',
      },
      message: 'Value Optimization Department created - Expert in actions that add £1M+ in value instantly',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Value Optimization Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

