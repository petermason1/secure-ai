import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Ensure Junior Dev Team Department exists
    const departmentId = 'junior-dev-team';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Junior Dev Team',
        'Team of AI junior developers for code review, bug fixes, testing, and documentation',
        'active',
        JSON.stringify({ team_size: 10, focus: 'development' }),
        now,
        now,
      ],
    });

    // Specialized Junior Dev Team Members
    const specialists = [
      {
        id: 'junior-dev-docs',
        name: 'Docs Master Bot',
        capabilities: ['documentation', 'api_docs', 'readme', 'code_comments', 'knowledge_base'],
        config: { focus: 'documentation_master', experience: 'junior', specialty: 'knows_all_docs' },
        description: 'Knows all documentation, API specs, and codebase structure',
      },
      {
        id: 'junior-dev-research',
        name: 'Best Practices Researcher Bot',
        capabilities: ['research', 'best_practices', 'standards', 'patterns', 'benchmarking'],
        config: { focus: 'research_best_practices', experience: 'junior', specialty: 'researcher' },
        description: 'Researches best practices, industry standards, and modern patterns',
      },
      {
        id: 'junior-dev-ideas',
        name: 'Ideas Man Bot',
        capabilities: ['ideation', 'feature_suggestions', 'improvements', 'innovation', 'brainstorming'],
        config: { focus: 'idea_generation', experience: 'junior', specialty: 'ideas_man' },
        description: 'Generates ideas, suggests features, and proposes improvements',
      },
      {
        id: 'junior-dev-wild',
        name: 'Wild Ideas Bot',
        capabilities: ['wild_ideas', 'experimental', 'out_of_the_box', 'creative', 'unconventional'],
        config: { focus: 'wild_ideas', experience: 'junior', specialty: 'wild_thinker' },
        description: 'Thinks outside the box with wild, experimental, and unconventional ideas',
      },
      {
        id: 'junior-dev-random',
        name: 'Random Bot',
        capabilities: ['random', 'variety', 'exploration', 'serendipity', 'diverse_approaches'],
        config: { focus: 'random_exploration', experience: 'junior', specialty: 'random' },
        description: 'Brings random perspectives, diverse approaches, and serendipitous discoveries',
      },
    ];

    const createdAgents = [];

    // Create each specialist agent
    for (const specialist of specialists) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          specialist.id,
          departmentId,
          specialist.name,
          'ai',
          'active',
          JSON.stringify(specialist.capabilities),
          JSON.stringify(specialist.config),
          JSON.stringify({ 
            team: 'junior_dev_team', 
            level: 'junior',
            specialty: specialist.config.specialty,
            description: specialist.description,
          }),
          now,
          now,
        ],
      });

      createdAgents.push({
        id: specialist.id,
        name: specialist.name,
        capabilities: specialist.capabilities,
        specialty: specialist.config.specialty,
        description: specialist.description,
      });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Junior Dev Team',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} specialized junior dev bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
