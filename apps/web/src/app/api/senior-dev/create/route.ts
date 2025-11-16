import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create Senior Dev Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Senior Dev%' OR name LIKE '%senior dev%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [
          departmentId,
          'Senior Dev Review',
          'Non-AI code expert who reviews AI-generated code using traditional methods, Stack Overflow, and old-school debugging techniques',
        ],
      });
    }

    // Create the Senior Dev bot (single expert, not AI-powered)
    const agentId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
            VALUES (?, ?, ?, 'human', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
      args: [
        agentId,
        departmentId,
        'Senior Dev - Code Review Expert',
        JSON.stringify([
          'code_review',
          'bug_detection',
          'security_audit',
          'performance_analysis',
          'stack_overflow_lookup',
          'anti_pattern_detection',
          'best_practices_enforcement',
          'refactoring_suggestions',
          'technical_debt_analysis',
        ]),
        JSON.stringify({
          icon: '👨‍💻',
          department: 'Senior Dev Review',
          method: 'traditional',
          uses_ai: false,
          tools: ['stack_overflow', 'code_analysis', 'manual_review', 'debugging'],
          experience: '20+ years',
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Senior Dev Review',
      },
      agent: {
        id: agentId,
        name: 'Senior Dev - Code Review Expert',
        type: 'human',
        uses_ai: false,
      },
      message: 'Senior Dev Review Department created - Non-AI code expert ready to review AI-generated code',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Senior Dev Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

