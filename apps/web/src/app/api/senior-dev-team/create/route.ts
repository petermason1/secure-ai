import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { count = 100 } = body;

    const now = new Date().toISOString();

    // Create Senior Dev Team Department
    const departmentId = 'senior-dev-team';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Senior Dev Team',
        'Senior developers for architecture, code review, and mentoring',
        'active',
        JSON.stringify({ team_size: count, focus: 'senior_development' }),
        now,
        now,
      ],
    });

    // Senior dev roles to cycle through
    const roles = [
      { name: 'Senior Architect', capabilities: ['architecture', 'system_design', 'technical_decisions', 'scalability', 'performance'] },
      { name: 'Senior Code Reviewer', capabilities: ['code_review', 'quality_assurance', 'best_practices', 'code_standards', 'merge_approval'] },
      { name: 'Senior Mentor', capabilities: ['mentoring', 'knowledge_transfer', 'team_leadership', 'coaching', 'training'] },
      { name: 'Senior Security', capabilities: ['security', 'compliance', 'vulnerability_assessment', 'security_reviews', 'penetration_testing'] },
      { name: 'Senior Performance', capabilities: ['performance', 'optimization', 'scaling', 'system_tuning', 'benchmarking'] },
    ];

    const createdAgents = [];

    // Create the requested number of senior devs
    for (let i = 0; i < count; i++) {
      const roleIndex = i % roles.length; // Cycle through roles
      const role = roles[roleIndex];
      const agentId = `senior-dev-${i + 1}`;
      const instanceNumber = Math.floor(i / roles.length) + 1;
      const agentName = count <= roles.length 
        ? role.name + ' Bot'
        : `${role.name} Bot ${instanceNumber}`;

      await turso.execute({
        sql: `INSERT OR REPLACE INTO agents (id, department_id, name, type, status, capabilities, config, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          agentId,
          departmentId,
          agentName,
          'ai',
          'active',
          JSON.stringify(role.capabilities),
          JSON.stringify({ 
            level: 'senior', 
            experience: 'senior',
            role: role.name,
            index: i + 1,
          }),
          JSON.stringify({ 
            team: 'senior_dev_team', 
            level: 'senior',
            role: role.name,
            instance: instanceNumber,
          }),
          now,
          now,
        ],
      });

      createdAgents.push({
        id: agentId,
        name: agentName,
        capabilities: role.capabilities,
        role: role.name,
      });
    }

    return NextResponse.json({
      success: true,
      department: {
        id: departmentId,
        name: 'Senior Dev Team',
      },
      count: createdAgents.length,
      agents: createdAgents.slice(0, 10), // Return first 10 for preview
      message: `Created ${createdAgents.length} senior dev bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
