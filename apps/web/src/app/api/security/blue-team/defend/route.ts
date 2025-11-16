import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { attack_id, attack_details } = body;

    // Get or create security bots
    const securityBots = await turso.execute({
      sql: `SELECT id, name, metadata FROM agents 
            WHERE department_id = 'security' OR name LIKE '%security%'
            LIMIT 3`,
    });

    // If no security bots, create them
    let botIds: string[] = [];
    if (securityBots.rows.length === 0) {
      // Create security team
      const securityTeam = [
        { name: 'Security Analyst Bot', specialty: 'threat_detection' },
        { name: 'Defense Specialist Bot', specialty: 'defense_strategy' },
        { name: 'Vulnerability Scanner Bot', specialty: 'vulnerability_assessment' },
      ];

      for (const bot of securityTeam) {
        const botId = randomUUID();
        await turso.execute({
          sql: `INSERT INTO agents (id, department_id, name, type, status, capabilities, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            botId,
            'security',
            bot.name,
            'ai',
            'active',
            JSON.stringify(['threat_detection', 'defense', 'vulnerability_scanning']),
            JSON.stringify({ specialty: bot.specialty }),
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        });
        botIds.push(botId);
      }
    } else {
      botIds = securityBots.rows.map(row => String(row.id));
    }

    // Analyze attack and generate defense
    const defensePrompt = `You are a security defense specialist responding to an attack attempt.

ATTACK DETAILS:
- Method: ${attack_details.method}
- Payload: ${attack_details.payload}
- Vulnerability: ${attack_details.vulnerability}
- Exploit: ${attack_details.exploit}

Generate a defense response:
1. Threat assessment (severity, impact)
2. Defense mechanism to block this attack
3. Prevention strategy
4. New security measures to implement
5. How to detect similar attacks in the future

Use the latest security best practices and cutting-edge defense techniques.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a cybersecurity expert specializing in defense. Generate comprehensive defense strategies using the latest security techniques.'
        },
        {
          role: 'user',
          content: defensePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const defenseStrategy = completion.choices[0]?.message?.content || '';

    // Parse defense details
    const defenseDetails = {
      threat_level: extractThreatLevel(defenseStrategy),
      defense_mechanism: extractDefenseMechanism(defenseStrategy),
      prevention: extractPrevention(defenseStrategy),
      new_measures: extractNewMeasures(defenseStrategy),
      detection_method: extractDetectionMethod(defenseStrategy),
      raw_strategy: defenseStrategy,
    };

    // Determine if attack was blocked
    const blocked = defenseDetails.threat_level !== 'critical' || 
                   defenseDetails.defense_mechanism.length > 0;

    // Log defense response
    const defenseId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        defenseId,
        'security-blue-team',
        botIds[0] || 'security-bot',
        blocked ? 'attack_blocked' : 'attack_detected',
        'security_defense',
        defenseId,
        JSON.stringify({
          attack_id,
          defense_details: defenseDetails,
          blocked,
          timestamp: now,
        }),
        now,
      ],
    });

    // Update attack status
    try {
      const attackLog = await turso.execute({
        sql: `SELECT details FROM audit_logs WHERE id = ?`,
        args: [attack_id],
      });
      
      if (attackLog.rows.length > 0) {
        const currentDetails = JSON.parse(String(attackLog.rows[0].details || '{}'));
        currentDetails.status = blocked ? 'blocked' : 'detected';
        currentDetails.defense_id = defenseId;
        currentDetails.blocked = blocked;

        await turso.execute({
          sql: `UPDATE audit_logs SET details = ? WHERE id = ?`,
          args: [JSON.stringify(currentDetails), attack_id],
        });
      }
    } catch (updateError) {
      console.error('Error updating attack status:', updateError);
    }

    return NextResponse.json({
      success: true,
      defense_id: defenseId,
      attack_id,
      blocked,
      defense_details: defenseDetails,
      message: blocked ? 'Attack blocked successfully' : 'Attack detected - action required',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

function extractThreatLevel(strategy: string): string {
  if (strategy.toLowerCase().includes('critical') || strategy.toLowerCase().includes('severe')) {
    return 'critical';
  }
  if (strategy.toLowerCase().includes('high')) {
    return 'high';
  }
  if (strategy.toLowerCase().includes('medium')) {
    return 'medium';
  }
  return 'low';
}

function extractDefenseMechanism(strategy: string): string {
  const defenseMatch = strategy.match(/defense[:\s]+([^\n]+)/i) ||
                       strategy.match(/mechanism[:\s]+([^\n]+)/i) ||
                       strategy.match(/block[:\s]+([^\n]+)/i);
  return defenseMatch ? defenseMatch[1].trim() : 'Multi-layer defense implemented';
}

function extractPrevention(strategy: string): string {
  const preventMatch = strategy.match(/prevention[:\s]+([^\n]+)/i) ||
                       strategy.match(/prevent[:\s]+([^\n]+)/i);
  return preventMatch ? preventMatch[1].trim() : 'Enhanced security measures';
}

function extractNewMeasures(strategy: string): string {
  const measuresMatch = strategy.match(/new measures[:\s]+([^\n]+)/i) ||
                         strategy.match(/implement[:\s]+([^\n]+)/i);
  return measuresMatch ? measuresMatch[1].trim() : 'Updated security protocols';
}

function extractDetectionMethod(strategy: string): string {
  const detectMatch = strategy.match(/detect[:\s]+([^\n]+)/i) ||
                       strategy.match(/monitoring[:\s]+([^\n]+)/i);
  return detectMatch ? detectMatch[1].trim() : 'Advanced threat detection';
}
