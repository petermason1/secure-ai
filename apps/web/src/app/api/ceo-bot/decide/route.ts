import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personality, decision, context, urgency = 'medium' } = body;

    if (!personality || !decision) {
      return NextResponse.json(
        { error: 'personality and decision are required' },
        { status: 400 }
      );
    }

    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    // Get CEO personality config
    const botResult = await turso.execute({
      sql: `SELECT metadata, config FROM agents 
            WHERE name = ? AND department_id = ?
            LIMIT 1`,
      args: [personality, 'ceo-bot'],
    });

    let ceoConfig: any = {};
    let validationMethod = 'Quick validation script';
    
    if (botResult.rows.length > 0) {
      ceoConfig = JSON.parse(String(botResult.rows[0].metadata || '{}'));
      const config = JSON.parse(String(botResult.rows[0].config || '{}'));
      validationMethod = config.validationMethod || 'Quick validation script';
    }

    const systemPrompt = `You are ${ceoConfig.name || personality}, CEO of ${ceoConfig.company || 'a major company'}.

Your style: ${ceoConfig.style || 'Strategic, decisive, visionary'}

Your decision-making approach: ${ceoConfig.decisionMaking?.join(', ') || 'Data-driven, strategic'}

Your focus areas: ${ceoConfig.focus?.join(', ') || 'Growth, innovation, excellence'}

Your catchphrases: ${ceoConfig.catchphrases?.join(', ') || 'Make it happen'}

Validation method: ${validationMethod}

Make a strategic decision in ${ceoConfig.name || personality}'s style. Provide:
1. **Decision**: Clear, decisive answer
2. **Rationale**: Why this decision aligns with your style and focus
3. **Quick Validation**: A fast way to prove/test this decision (script, visual, analysis, etc.)
4. **Action Plan**: Immediate next steps
5. **Risk Assessment**: Key risks and mitigations
6. **Expected Outcome**: What success looks like

Be decisive, strategic, and provide actionable validation.`;

    const userPrompt = `Decision needed: "${decision}"

${context ? `Context: ${context}` : ''}

Urgency: ${urgency}

Make a decision in ${ceoConfig.name || personality}'s style and provide a quick validation method.`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const decisionContent = response.choices[0]?.message?.content || 'Decision generation failed.';

    // Parse the response to extract structured data
    const decisionMatch = decisionContent.match(/\*\*Decision\*\*:?\s*(.+?)(?=\*\*|$)/is);
    const rationaleMatch = decisionContent.match(/\*\*Rationale\*\*:?\s*(.+?)(?=\*\*|$)/is);
    const validationMatch = decisionContent.match(/\*\*Quick Validation\*\*:?\s*(.+?)(?=\*\*|$)/is);
    const actionPlanMatch = decisionContent.match(/\*\*Action Plan\*\*:?\s*(.+?)(?=\*\*|$)/is);
    const riskMatch = decisionContent.match(/\*\*Risk Assessment\*\*:?\s*(.+?)(?=\*\*|$)/is);
    const outcomeMatch = decisionContent.match(/\*\*Expected Outcome\*\*:?\s*(.+?)(?=\*\*|$)/is);

    // Generate quick validation script/code if needed
    let validationScript = '';
    if (validationMatch && validationMethod.includes('script')) {
      const validationPrompt = validationMatch[1];
      const scriptResponse = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `Generate a quick validation script (Python, JavaScript, or shell script) to test/prove the following: ${validationPrompt}. Make it simple, runnable, and fast.`,
          },
          {
            role: 'user',
            content: 'Create a quick validation script.',
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });
      validationScript = scriptResponse.choices[0]?.message?.content || '';
    }

    // Store decision in database
    const decisionId = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
            VALUES (?, (SELECT id FROM agents WHERE name = ? AND department_id = ? LIMIT 1), ?, ?, datetime('now'))`,
      args: [
        decisionId,
        ceoConfig.name || personality,
        'ceo-bot',
        'strategic_decision',
        JSON.stringify({
          decision,
          context,
          urgency,
          fullResponse: decisionContent,
          decisionText: decisionMatch?.[1] || '',
          rationale: rationaleMatch?.[1] || '',
          validation: validationMatch?.[1] || '',
          actionPlan: actionPlanMatch?.[1] || '',
          riskAssessment: riskMatch?.[1] || '',
          expectedOutcome: outcomeMatch?.[1] || '',
          validationScript,
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      decision: decisionMatch?.[1] || decisionContent.split('\n')[0],
      rationale: rationaleMatch?.[1] || '',
      quickValidation: validationMatch?.[1] || '',
      validationScript,
      actionPlan: actionPlanMatch?.[1] || '',
      riskAssessment: riskMatch?.[1] || '',
      expectedOutcome: outcomeMatch?.[1] || '',
      fullResponse: decisionContent,
      personality: ceoConfig.name || personality,
      company: ceoConfig.company || '',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error, details: error?.message },
      { status: handled.code }
    );
  }
}

