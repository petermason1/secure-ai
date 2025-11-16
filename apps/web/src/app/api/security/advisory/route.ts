import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

/**
 * Security Advisory - Ask security team for input on privacy, security, and code protection
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const { question, context } = await request.json();

    // Get security team agents
    const securityAgentsResult = await turso.execute({
      sql: `SELECT a.id, a.name, a.capabilities, a.metadata
            FROM agents a
            JOIN departments d ON a.department_id = d.id
            WHERE d.name LIKE '%security%' OR d.name LIKE '%Security%'
            AND a.status = 'active'`,
    });

    const securityAgents = securityAgentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      metadata: JSON.parse(String(row.metadata || '{}')),
    }));

    // Generate security advisory
    const prompt = `You are a Security Team providing advisory on privacy, security, and code protection.

QUESTION: ${question || 'What security measures should we implement?'}

CONTEXT: ${context || 'AI Company Builder platform with multiple departments and bots'}

SECURITY TEAM CAPABILITIES:
${securityAgents.map((a: any) => `- ${a.name}: ${a.capabilities.join(', ')}`).join('\n')}

Provide a comprehensive security advisory covering:
1. Privacy protection (code, ideas, data)
2. Access control and authentication
3. Public vs private endpoints
4. Data encryption and storage
5. API security
6. Compliance (GDPR, SOC2, etc.)
7. Recommendations for the specific question

Format as JSON:
{
  "risk_assessment": "low|medium|high|critical",
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "action": "specific action to take",
      "reason": "why this is important",
      "impact": "what happens if not done"
    }
  ],
  "compliance_check": ["GDPR", "SOC2", "etc"],
  "immediate_actions": ["action1", "action2"],
  "long_term_strategy": "overall security strategy"
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Security Team providing comprehensive security advisory for an AI Company Builder platform. Be thorough, practical, and prioritize actionable recommendations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const advisoryContent = completion.choices[0]?.message?.content || '{}';
    const advisory = JSON.parse(advisoryContent);

    // Determine priority from risk assessment
    const priority = advisory.risk_assessment === 'critical' ? 'critical' :
                     advisory.risk_assessment === 'high' ? 'high' :
                     advisory.risk_assessment === 'medium' ? 'medium' : 'low';

    // Save advisory to security_advisories table
    const advisoryId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await turso.execute({
      sql: `INSERT INTO security_advisories 
            (id, question, context, status, priority, asked_by, answered_by_agent_id, 
             response, advisory_data, tags, created_at, answered_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        advisoryId,
        question,
        context || '',
        'answered',
        priority,
        'user', // TODO: Get from auth
        securityAgents[0]?.id || null,
        JSON.stringify(advisory),
        JSON.stringify(advisory),
        JSON.stringify(['security', 'advisory', advisory.risk_assessment]),
        now,
        now,
        now,
      ],
    });

    // Log to audit log
    await turso.execute({
      sql: `INSERT INTO security_audit_log 
            (id, action_type, agent_id, action_description, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'advisory_answered',
        securityAgents[0]?.id || null,
        `Security advisory provided for: ${question.substring(0, 100)}`,
        JSON.stringify({ advisory_id: advisoryId, priority }),
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      advisory_id: advisoryId,
      advisory,
      security_agents_consulted: securityAgents.length,
      status: 'answered',
      timestamp: now,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

