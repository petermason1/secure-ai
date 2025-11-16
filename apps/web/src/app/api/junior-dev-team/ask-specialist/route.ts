import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { specialist_type, question, context } = body;

    if (!specialist_type || !question) {
      return NextResponse.json(
        { error: 'specialist_type and question are required' },
        { status: 400 }
      );
    }

    // Map specialist types to agent IDs
    const specialistMap: Record<string, string> = {
      docs: 'junior-dev-docs',
      research: 'junior-dev-research',
      ideas: 'junior-dev-ideas',
      wild: 'junior-dev-wild',
      random: 'junior-dev-random',
    };

    const agentId = specialistMap[specialist_type];
    if (!agentId) {
      return NextResponse.json(
        { error: `Invalid specialist_type. Use: docs, research, ideas, wild, or random` },
        { status: 400 }
      );
    }

    // Get agent details
    const agentResult = await turso.execute({
      sql: `SELECT id, name, capabilities, config, metadata FROM agents WHERE id = ?`,
      args: [agentId],
    });

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Specialist agent not found. Create them first with /api/junior-dev-team/create-specialists' },
        { status: 404 }
      );
    }

    const agent = agentResult.rows[0];
    const agentName = agent.name;
    const capabilities = JSON.parse(String(agent.capabilities || '[]'));
    const metadata = JSON.parse(String(String(agent.metadata || '{}')));

    // Create specialist-specific prompts
    const prompts: Record<string, string> = {
      docs: `You are ${agentName}, a documentation master who knows all the docs, API specs, and codebase structure.

Question: ${question}
${context ? `Context: ${context}` : ''}

Provide a comprehensive answer based on your knowledge of all documentation, APIs, and codebase structure. Reference specific docs, endpoints, or code sections when relevant.`,

      research: `You are ${agentName}, a best practices researcher who studies industry standards and modern patterns.

Question: ${question}
${context ? `Context: ${context}` : ''}

Research and provide best practices, industry standards, modern patterns, and recommendations. Include references to authoritative sources when possible.`,

      ideas: `You are ${agentName}, an ideas man who generates creative suggestions and improvements.

Question: ${question}
${context ? `Context: ${context}` : ''}

Generate creative ideas, feature suggestions, and improvements. Think about what would make this better, more useful, or more innovative.`,

      wild: `You are ${agentName}, a wild ideas bot who thinks outside the box with experimental and unconventional approaches.

Question: ${question}
${context ? `Context: ${context}` : ''}

Think completely outside the box. Provide wild, experimental, unconventional ideas. Don't hold back - be creative and bold!`,

      random: `You are ${agentName}, a random bot who brings diverse perspectives and serendipitous discoveries.

Question: ${question}
${context ? `Context: ${context}` : ''}

Provide a random, diverse perspective. Explore unexpected angles, serendipitous connections, and varied approaches. Be unpredictable!`,
    };

    const prompt = prompts[specialist_type] || question;

    // Get AI response
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: `You are ${agentName}. ${metadata.description || ''} Capabilities: ${capabilities.join(', ')}` 
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json({
      success: true,
      specialist: {
        id: agentId,
        name: agentName,
        type: specialist_type,
      },
      question,
      answer: response.choices[0].message.content,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
