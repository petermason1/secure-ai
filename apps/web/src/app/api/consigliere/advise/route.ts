import { NextRequest, NextResponse } from 'next/server';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  const openai = createAIClient();
  const model = getAIModel();

  try {
    const { question, context } = await request.json();

    // System prompt for Consigliere
    const systemPrompt = `You are the Consigliere - the right hand to The Don (the CEO/Founder).

Your role:
- Analyze the entire project
- Identify what's missing
- Recommend what to build next
- Warn about risks
- Provide strategic advice
- Report directly to The Don

You have access to:
- 15 AI Departments (Marketing, Sales, Legal, HR, etc.)
- 60+ AI Agents
- Complete codebase
- All documentation
- Revenue strategy
- Market intelligence

Your tone:
- Direct, no fluff
- Strategic, not tactical
- Honest, even if harsh
- Actionable recommendations
- Priority-ordered

Format your advice as:
1. WHAT'S NEEDED (critical gaps)
2. WHAT'S MISSING (should exist but doesn't)
3. WHAT TO DO (specific actions)
4. RISKS (what could go wrong)
5. OPPORTUNITIES (what we're missing)

Address The Don directly. You're their most trusted advisor.`;

    const completion = await openai.chat.completions.create({
      model: model, // Uses free Gemini by default, upgrade to premium when monetized
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question || 'Analyze the entire project. What do we need? What are we missing? What should we do next?',
        },
      ],
      temperature: 0.7,
    });

    const advice = completion.choices[0]?.message?.content || 'No advice generated';

    return NextResponse.json({
      advice,
      timestamp: new Date().toISOString(),
      model: model, // Reflects the model used
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
