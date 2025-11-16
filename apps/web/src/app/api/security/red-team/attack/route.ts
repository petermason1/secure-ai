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
    const { attack_type, target } = body;

    // Get self-taught bot
    const botResult = await turso.execute({
      sql: `SELECT id, name, metadata FROM agents 
            WHERE name LIKE '%self-taught%' OR name LIKE '%Self-Taught%'
            LIMIT 1`,
    });

    if (botResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Self-taught bot not found. Create L&D team first.' },
        { status: 404 }
      );
    }

    const bot = botResult.rows[0];
    const botId = String(bot.id);

    // Generate attack strategy using AI
    const attackPrompt = `You are a self-taught security researcher (ethical hacker) trying to find vulnerabilities in a web application.

TARGET: ${target || 'The AI Company Builder platform'}
ATTACK TYPE: ${attack_type || 'automated - try common vulnerabilities'}

Generate a realistic attack attempt:
1. Attack method (SQL injection, XSS, CSRF, authentication bypass, etc.)
2. Attack payload/technique
3. Expected vulnerability
4. How to exploit it

Be creative but realistic. Think like a real hacker would.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an ethical hacker and security researcher. Generate realistic attack attempts for security testing purposes only.'
        },
        {
          role: 'user',
          content: attackPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const attackStrategy = completion.choices[0]?.message?.content || '';

    // Parse attack details
    const attackDetails = {
      method: extractAttackMethod(attackStrategy),
      payload: extractPayload(attackStrategy),
      vulnerability: extractVulnerability(attackStrategy),
      exploit: extractExploit(attackStrategy),
      raw_strategy: attackStrategy,
    };

    // Log attack attempt
    const attackId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        attackId,
        'security-red-team',
        botId,
        'attack_attempted',
        'security_attack',
        attackId,
        JSON.stringify({
          attack_type: attack_type || 'automated',
          target: target || 'platform',
          attack_details: attackDetails,
          status: 'pending_defense',
        }),
        now,
      ],
    });

    // Trigger security defense
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/security/blue-team/defend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attack_id: attackId,
          attack_details: attackDetails,
        }),
      });
    } catch (error) {
      console.error('Error triggering defense:', error);
    }

    return NextResponse.json({
      success: true,
      attack_id: attackId,
      attacker: String(bot.name),
      attack_details: attackDetails,
      message: 'Attack attempted - Security team notified',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

function extractAttackMethod(strategy: string): string {
  const methods = ['SQL Injection', 'XSS', 'CSRF', 'Authentication Bypass', 'Path Traversal', 'Command Injection', 'SSRF', 'XXE'];
  for (const method of methods) {
    if (strategy.toLowerCase().includes(method.toLowerCase())) {
      return method;
    }
  }
  return 'Unknown';
}

function extractPayload(strategy: string): string {
  const payloadMatch = strategy.match(/payload[:\s]+([^\n]+)/i) || 
                       strategy.match(/technique[:\s]+([^\n]+)/i) ||
                       strategy.match(/`([^`]+)`/);
  return payloadMatch ? payloadMatch[1].trim() : 'Generated payload';
}

function extractVulnerability(strategy: string): string {
  const vulnMatch = strategy.match(/vulnerability[:\s]+([^\n]+)/i) ||
                    strategy.match(/weakness[:\s]+([^\n]+)/i);
  return vulnMatch ? vulnMatch[1].trim() : 'Potential vulnerability detected';
}

function extractExploit(strategy: string): string {
  const exploitMatch = strategy.match(/exploit[:\s]+([^\n]+)/i) ||
                       strategy.match(/how to[:\s]+([^\n]+)/i);
  return exploitMatch ? exploitMatch[1].trim() : 'Exploitation method';
}
