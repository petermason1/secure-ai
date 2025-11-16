import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const now = new Date().toISOString();

    // Create Legal Department
    const departmentId = 'legal-department';
    await turso.execute({
      sql: `INSERT OR IGNORE INTO departments (id, name, description, status, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        departmentId,
        'Legal Department',
        'Smart contracts, agreements, risk/compliance, policy drafting',
        'active',
        JSON.stringify({ focus: 'legal_operations', automation_level: 'high' }),
        now,
        now,
      ],
    });

    // Legal Department Agents
    const legalAgents = [
      {
        id: 'legal-contracts-bot',
        name: 'Contract Generator',
        capabilities: ['contract_generation', 'contract_analysis', 'template_management'],
        config: { focus: 'contract_creation', experience: 'senior' },
        metadata: { icon: '📝', description: 'Generates and manages legal contracts' },
      },
      {
        id: 'legal-risk-bot',
        name: 'Risk Assessor',
        capabilities: ['risk_assessment', 'compliance_check', 'legal_analysis'],
        config: { focus: 'risk_management', experience: 'senior' },
        metadata: { icon: '⚠️', description: 'Assesses legal and compliance risks' },
      },
      {
        id: 'legal-policy-bot',
        name: 'Policy Drafter',
        capabilities: ['policy_drafting', 'legal_writing', 'compliance_review'],
        config: { focus: 'policy_creation', experience: 'senior' },
        metadata: { icon: '📋', description: 'Drafts legal policies and documents' },
      },
      {
        id: 'legal-compliance-bot',
        name: 'Compliance Monitor',
        capabilities: ['compliance_monitoring', 'regulatory_updates', 'audit_support'],
        config: { focus: 'compliance', experience: 'senior' },
        metadata: { icon: '🔍', description: 'Monitors compliance with regulations' },
      },
      {
        id: 'legal-review-bot',
        name: 'Document Reviewer',
        capabilities: ['document_review', 'legal_analysis', 'redlining'],
        config: { focus: 'document_review', experience: 'senior' },
        metadata: { icon: '👁️', description: 'Reviews legal documents and agreements' },
      },
      {
        id: 'legal-advisory-bot',
        name: 'Legal Advisor',
        capabilities: ['legal_advice', 'strategy_guidance', 'dispute_resolution'],
        config: { focus: 'legal_guidance', experience: 'senior' },
        metadata: { icon: '⚖️', description: 'Provides legal advice and guidance' },
      },
    ];

    const createdAgents = [];

    // Create each legal agent
    for (const agent of legalAgents) {
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
        name: 'Legal Department',
      },
      agents: createdAgents,
      message: `Created ${createdAgents.length} Legal bots`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

