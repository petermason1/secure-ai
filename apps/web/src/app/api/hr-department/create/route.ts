import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create HR Department
    const departmentId = 'hr-department';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'HR Department',
        'Automated HR operations: onboarding, contracts, compliance, reviews, leave tracking',
        'active',
        JSON.stringify({ focus: 'human_resources', automation_level: 'high' }),
        now,
        now,
      ],
    });

    // HR Department Agents
    const hrAgents = [
      {
        id: 'hr-onboarding-bot',
        name: 'Onboarding Specialist',
        capabilities: ['onboarding', 'document_management', 'compliance_check'],
        config: { focus: 'employee_onboarding', experience: 'senior' },
        metadata: { icon: '👋', description: 'Automates new employee onboarding process' },
      },
      {
        id: 'hr-contracts-bot',
        name: 'Contracts Manager',
        capabilities: ['contract_generation', 'contract_review', 'compliance'],
        config: { focus: 'contract_management', experience: 'senior' },
        metadata: { icon: '📄', description: 'Manages employment contracts and agreements' },
      },
      {
        id: 'hr-compliance-bot',
        name: 'Compliance Officer',
        capabilities: ['compliance_monitoring', 'audit_preparation', 'regulatory_updates'],
        config: { focus: 'compliance', experience: 'senior' },
        metadata: { icon: '✅', description: 'Ensures HR compliance with regulations' },
      },
      {
        id: 'hr-reviews-bot',
        name: 'Performance Review Coordinator',
        capabilities: ['performance_reviews', 'feedback_collection', 'review_scheduling'],
        config: { focus: 'performance_management', experience: 'senior' },
        metadata: { icon: '📊', description: 'Coordinates and manages performance reviews' },
      },
      {
        id: 'hr-leave-bot',
        name: 'Leave Management System',
        capabilities: ['leave_tracking', 'approval_workflow', 'calendar_integration'],
        config: { focus: 'leave_management', experience: 'senior' },
        metadata: { icon: '🏖️', description: 'Tracks and manages employee leave requests' },
      },
      {
        id: 'hr-analytics-bot',
        name: 'HR Analytics',
        capabilities: ['hr_analytics', 'trend_analysis', 'reporting'],
        config: { focus: 'hr_insights', experience: 'senior' },
        metadata: { icon: '📈', description: 'Provides HR analytics and insights' },
      },
    ];

    const createdAgents = [];

    // Create each HR agent
    for (const agent of hrAgents) {
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
        name: 'HR Department',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} HR bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

