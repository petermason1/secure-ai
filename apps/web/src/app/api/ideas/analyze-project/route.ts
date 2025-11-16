import { NextRequest, NextResponse } from 'next/server';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { generateIdea } from '@idea-randomizer/core';

export async function POST(request: NextRequest) {
  try {
    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { project_description, focus_area } = body;

    // Project summary for idea generation
    const projectSummary = project_description || `Autonomous AI Company Builder Platform with:
- 15+ AI-powered departments (Psychology, Marketing, Sales, HR, Legal, etc.)
- Bot Activity HUD for monitoring AI agents
- Junior Dev Team, Senior Dev Team, Learning & Development bots
- Bot Hub for inter-agent communication
- Storage & Filing Department
- Post Team for message processing
- Media Team for press releases
- Health & Safety department
- Psychology research system (analyzing game shows, PPV events, concerts)
- Marketing and L&D processing workflows
- Bot avatars and missions system
- Scrum meetings, KANBAN boards, JIT bots
- Token management system
- Inter-department meetings
- Turso database backend
- Vercel AI Gateway integration
- Zero-setup philosophy`;

    // Generate ideas based on project
    const idea = generateIdea({
      themeId: 'ai-productivity',
      audienceId: 'solo-founders',
      problemId: 'idea-fatigue',
      twistId: 'ai-companion',
    });

    // Get AI analysis of project through idea generator lens
    const analysisPrompt = `You are analyzing a project through the Idea Generator framework.

PROJECT DESCRIPTION:
${projectSummary}

FOCUS AREA: ${focus_area || 'general improvement and monetization'}

Generate ideas for:
1. How to improve/expand this project
2. Monetization opportunities
3. New features or departments
4. Marketing angles
5. Product positioning

Use the Idea Generator taxonomy to create structured ideas. Format as JSON with categories.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an idea generator analyzing projects and generating actionable ideas. Provide structured, creative insights.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const analysis = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      generated_idea: idea,
      project_analysis: analysis,
      project_summary: projectSummary,
      focus_area: focus_area || 'general',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
