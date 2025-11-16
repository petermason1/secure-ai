import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get or create Code Editor Department
    let departmentResult = await turso.execute({
      sql: `SELECT id FROM departments WHERE name LIKE '%Code Editor%' OR name LIKE '%code%editor%' LIMIT 1`,
    });

    let departmentId = departmentResult.rows[0]?.id;
    if (!departmentId) {
      departmentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO departments (id, name, description, status, config, created_at, updated_at)
              VALUES (?, ?, ?, 'active', '{}', datetime('now'), datetime('now'))`,
        args: [
          departmentId,
          'Code Editor',
          'AI-powered code editor with autocomplete, code review, refactoring, and AI chat - similar to Cursor',
        ],
      });
    }

    // Create Code Editor bots
    const bots = [
      {
        name: 'Code Completion Bot',
        capabilities: ['autocomplete', 'code_suggestions', 'intelligent_completion', 'context_aware_suggestions'],
        icon: '⚡',
      },
      {
        name: 'Code Review Bot',
        capabilities: ['code_review', 'bug_detection', 'security_scan', 'performance_analysis', 'best_practices'],
        icon: '🔍',
      },
      {
        name: 'Refactoring Bot',
        capabilities: ['code_refactoring', 'optimization', 'code_cleanup', 'pattern_detection'],
        icon: '🔧',
      },
      {
        name: 'AI Chat Assistant',
        capabilities: ['code_explanation', 'debugging_help', 'architecture_advice', 'documentation_generation'],
        icon: '💬',
      },
      {
        name: 'Documentation Bot',
        capabilities: ['generate_documentation', 'code_comments', 'api_docs', 'readme_generation'],
        icon: '📝',
      },
      {
        name: 'Test Generator Bot',
        capabilities: ['test_generation', 'unit_tests', 'integration_tests', 'test_coverage'],
        icon: '🧪',
      },
    ];

    const createdBots = [];

    for (const bot of bots) {
      // Check if bot exists
      const existingBot = await turso.execute({
        sql: `SELECT id FROM agents WHERE name = ? AND department_id = ?`,
        args: [bot.name, departmentId],
      });

      if (existingBot.rows.length > 0) {
        createdBots.push({ id: existingBot.rows[0].id, name: bot.name, icon: bot.icon, exists: true });
        continue;
      }

      const agentId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, 'ai', 'active', ?, '{}', ?, datetime('now'), datetime('now'))`,
        args: [
          agentId,
          departmentId,
          bot.name,
          JSON.stringify(bot.capabilities),
          JSON.stringify({ icon: bot.icon, department: 'Code Editor', editor_type: 'cursor_like' }),
        ],
      });
      createdBots.push({ id: agentId, name: bot.name, icon: bot.icon });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Code Editor',
      },
      bots: createdBots,
      message: 'Code Editor Department created with 6 AI-powered coding bots',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create Code Editor Department', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

