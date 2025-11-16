import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create Learning & Development Department
    const departmentId = 'learning-dev-team';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Learning & Development Team',
        'Training, knowledge management, and skill development for all bots',
        'active',
        JSON.stringify({ team_size: 5, focus: 'learning_development' }),
        now,
        now,
      ],
    });

    // L&D Team with Diverse Backgrounds
    const ldBots = [
      {
        id: 'ld-stats-phd',
        name: 'Dr. Stats Bot (PhD Statistics)',
        capabilities: ['statistical_analysis', 'data_science', 'research_methodology', 'experimental_design', 'hypothesis_testing', 'regression_analysis'],
        config: { 
          level: 'senior',
          education: 'phd_statistics',
          background: 'phd',
          specialty: 'statistics',
        },
        description: 'PhD in Statistics - Expert in data analysis, research methodology, and statistical learning',
        metadata: {
          team: 'learning_dev_team',
          level: 'senior',
          education: 'PhD Statistics',
          background: 'Academic - PhD in Statistics',
          expertise: 'Statistical analysis, data science, research methods',
        },
      },
      {
        id: 'ld-cs-phd',
        name: 'Dr. CS Bot (PhD Computer Science)',
        capabilities: ['computer_science', 'algorithms', 'systems_design', 'theoretical_cs', 'distributed_systems', 'machine_learning'],
        config: { 
          level: 'senior',
          education: 'phd_computer_science',
          background: 'phd',
          specialty: 'computer_science',
        },
        description: 'PhD in Computer Science - Expert in algorithms, systems design, and theoretical CS',
        metadata: {
          team: 'learning_dev_team',
          level: 'senior',
          education: 'PhD Computer Science',
          background: 'Academic - PhD in Computer Science',
          expertise: 'Algorithms, systems design, theoretical CS, ML',
        },
      },
      {
        id: 'ld-self-taught',
        name: 'Self-Taught Bot',
        capabilities: ['practical_skills', 'real_world_experience', 'problem_solving', 'hacking', 'pragmatic_approaches', 'street_smarts'],
        config: { 
          level: 'senior',
          education: 'self_taught',
          background: 'self_taught',
          specialty: 'practical_experience',
        },
        description: 'Self-taught expert - Learned through practice, real-world experience, and hands-on problem solving',
        metadata: {
          team: 'learning_dev_team',
          level: 'senior',
          education: 'Self-Taught',
          background: 'Self-Taught - Learned through practice',
          expertise: 'Practical skills, real-world experience, problem solving',
        },
      },
      {
        id: 'ld-sales-expert',
        name: 'Sales Expert Bot',
        capabilities: ['sales', 'business_development', 'customer_relations', 'negotiation', 'market_analysis', 'revenue_generation'],
        config: { 
          level: 'senior',
          education: 'sales_expert',
          background: 'sales',
          specialty: 'sales',
        },
        description: 'Sales expert - Understands business, revenue, customer needs, and market dynamics',
        metadata: {
          team: 'learning_dev_team',
          level: 'senior',
          education: 'Sales Expert',
          background: 'Sales - Expert in business and revenue',
          expertise: 'Sales, business development, customer relations',
        },
      },
      {
        id: 'ld-random',
        name: 'Random Learning Bot',
        capabilities: ['random_knowledge', 'diverse_perspectives', 'unconventional_learning', 'cross_disciplinary', 'serendipity', 'creative_teaching'],
        config: { 
          level: 'senior',
          education: 'random',
          background: 'random',
          specialty: 'random',
        },
        description: 'Random learning approach - Brings diverse, unexpected perspectives and unconventional teaching methods',
        metadata: {
          team: 'learning_dev_team',
          level: 'senior',
          education: 'Random',
          background: 'Random - Diverse and unexpected',
          expertise: 'Random knowledge, diverse perspectives, creative teaching',
        },
      },
    ];

    const createdAgents = [];

    // Create each L&D bot
    for (const bot of ldBots) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          bot.id,
          departmentId,
          bot.name,
          'ai',
          'active',
          JSON.stringify(bot.capabilities),
          JSON.stringify(bot.config),
          JSON.stringify(bot.metadata),
          now,
          now,
        ],
      });

      createdAgents.push({
        id: bot.id,
        name: bot.name,
        capabilities: bot.capabilities,
        background: bot.metadata.background,
        expertise: bot.metadata.expertise,
      });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Learning & Development Team',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} L&D bots with diverse backgrounds`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
