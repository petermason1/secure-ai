import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create Junior Dev Team Department
    const departmentId = 'junior-dev-team';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Junior Dev Team',
        'Team of AI junior developers for code review, bug fixes, testing, and documentation',
        'active',
        JSON.stringify({ team_size: 5, focus: 'development' }),
        now,
        now,
      ],
    });

    // Junior Dev Team Members
    const juniorDevs = [
      {
        id: 'junior-dev-1',
        name: 'Code Reviewer Bot',
        capabilities: ['code_review', 'linting', 'best_practices'],
        config: { focus: 'code_quality', experience: 'junior' },
      },
      {
        id: 'junior-dev-2',
        name: 'Bug Fixer Bot',
        capabilities: ['bug_fixing', 'debugging', 'error_handling'],
        config: { focus: 'bug_resolution', experience: 'junior' },
      },
      {
        id: 'junior-dev-3',
        name: 'Test Writer Bot',
        capabilities: ['testing', 'unit_tests', 'integration_tests'],
        config: { focus: 'test_coverage', experience: 'junior' },
      },
      {
        id: 'junior-dev-4',
        name: 'Documentation Bot',
        capabilities: ['documentation', 'comments', 'readme'],
        config: { focus: 'documentation', experience: 'junior' },
      },
      {
        id: 'junior-dev-5',
        name: 'Refactoring Bot',
        capabilities: ['refactoring', 'code_cleanup', 'optimization'],
        config: { focus: 'code_improvement', experience: 'junior' },
      },
    ];

    const createdAgents = [];

    // Create each junior dev agent
    for (const dev of juniorDevs) {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          dev.id,
          departmentId,
          dev.name,
          'ai',
          'active',
          JSON.stringify(dev.capabilities),
          JSON.stringify(dev.config),
          JSON.stringify({ team: 'junior_dev_team', level: 'junior' }),
          now,
          now,
        ],
      });

      createdAgents.push({
        id: dev.id,
        name: dev.name,
        capabilities: dev.capabilities,
      });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Junior Dev Team',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} junior dev bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
