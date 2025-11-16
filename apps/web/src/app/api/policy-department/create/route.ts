import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create Policy/Governance Department
    const departmentId = 'policy-department';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Policy & Governance',
        'Company guidelines, automated audits, Q&A on rules/ethics/privacy',
        'active',
        JSON.stringify({ focus: 'governance', automation_level: 'high' }),
        now,
        now,
      ],
    });

    // Policy/Governance Department Agents
    const policyAgents = [
      {
        id: 'policy-guidelines-bot',
        name: 'Guidelines Drafter',
        capabilities: ['guideline_creation', 'policy_writing', 'documentation'],
        config: { focus: 'guideline_management', experience: 'senior' },
        metadata: { icon: '📜', description: 'Drafts company guidelines and policies' },
      },
      {
        id: 'policy-audit-bot',
        name: 'Audit Coordinator',
        capabilities: ['audit_planning', 'compliance_audit', 'findings_analysis'],
        config: { focus: 'audit_management', experience: 'senior' },
        metadata: { icon: '🔎', description: 'Coordinates automated audits' },
      },
      {
        id: 'policy-qa-bot',
        name: 'Policy Q&A Assistant',
        capabilities: ['policy_qa', 'rule_interpretation', 'guidance_provision'],
        config: { focus: 'policy_support', experience: 'senior' },
        metadata: { icon: '❓', description: 'Answers questions about rules, ethics, privacy' },
      },
      {
        id: 'policy-ethics-bot',
        name: 'Ethics Advisor',
        capabilities: ['ethics_review', 'ethical_guidance', 'conflict_resolution'],
        config: { focus: 'ethics', experience: 'senior' },
        metadata: { icon: '⚖️', description: 'Provides ethical guidance and review' },
      },
      {
        id: 'policy-privacy-bot',
        name: 'Privacy Officer',
        capabilities: ['privacy_compliance', 'data_protection', 'gdpr_compliance'],
        config: { focus: 'privacy', experience: 'senior' },
        metadata: { icon: '🔒', description: 'Manages privacy and data protection policies' },
      },
      {
        id: 'policy-compliance-bot',
        name: 'Compliance Monitor',
        capabilities: ['compliance_monitoring', 'regulatory_tracking', 'violation_detection'],
        config: { focus: 'compliance', experience: 'senior' },
        metadata: { icon: '✅', description: 'Monitors compliance with policies and regulations' },
      },
    ];

    const createdAgents = [];

    // Create each policy agent
    for (const agent of policyAgents) {
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
        name: 'Policy & Governance',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} Policy/Governance bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

