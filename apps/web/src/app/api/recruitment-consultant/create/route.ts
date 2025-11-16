import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create Recruitment Consultant Department
    const departmentId = 'recruitment-consultant';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Recruitment Consultant',
        'Analyzes skill gaps, recommends human hires, forecasts cost/value, prioritizes hiring order',
        'active',
        JSON.stringify({ focus: 'recruitment_consulting', automation_level: 'high' }),
        now,
        now,
      ],
    });

    // Recruitment Consultant Agents
    const recruitmentAgents = [
      {
        id: 'recruitment-analyzer-bot',
        name: 'Skill Gap Analyzer',
        capabilities: ['skill_gap_analysis', 'capability_assessment', 'department_analysis'],
        config: { focus: 'gap_analysis', experience: 'senior' },
        metadata: { icon: '🔍', description: 'Analyzes department capabilities and skill gaps' },
      },
      {
        id: 'recruitment-recommender-bot',
        name: 'Hire Recommender',
        capabilities: ['role_recommendation', 'hiring_prioritization', 'cost_forecasting'],
        config: { focus: 'recommendations', experience: 'senior' },
        metadata: { icon: '💡', description: 'Recommends necessary human hires with cost/value forecasts' },
      },
      {
        id: 'recruitment-planner-bot',
        name: 'Hiring Plan Creator',
        capabilities: ['hiring_plan_creation', 'timeline_forecasting', 'budget_planning'],
        config: { focus: 'planning', experience: 'senior' },
        metadata: { icon: '📅', description: 'Creates comprehensive hiring plans and timelines' },
      },
      {
        id: 'recruitment-advisor-bot',
        name: 'Human Resource Advisor',
        capabilities: ['hr_consulting', 'fractional_hiring', 'team_optimization'],
        config: { focus: 'advisory', experience: 'senior' },
        metadata: { icon: '👥', description: 'Provides advisory on minimal viable humans needed' },
      },
    ];

    const createdAgents = [];

    // Create each recruitment agent
    for (const agent of recruitmentAgents) {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          agent.id,
          departmentId,
          agent.name,
          'ai',
          'active',
          JSON.stringify(agent.capabilities),
          JSON.stringify(agent.config),
          JSON.stringify(agent.metadata),
          now,
          now,
        ],
      });

      createdAgents.push({
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
      });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Recruitment Consultant',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} Recruitment Consultant bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

