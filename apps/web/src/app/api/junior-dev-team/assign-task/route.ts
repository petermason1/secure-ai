import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { task_type, description, code, file_path, priority } = body;

    if (!task_type || !description) {
      return NextResponse.json(
        { error: 'task_type and description are required' },
        { status: 400 }
      );
    }

    // Determine which junior dev should handle this task
    const assignedAgent = await assignToBestAgent(turso, task_type, description);

    // Create task record
    const taskId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        taskId,
        'junior-dev-team',
        assignedAgent.id,
        'task_assigned',
        'task',
        taskId,
        JSON.stringify({
          task_type,
          description,
          code: code || null,
          file_path: file_path || null,
          priority: priority || 'medium',
          assigned_to: assignedAgent.name,
        }),
        now,
      ],
    });

    // Have the agent work on the task
    const result = await workOnTask(openai, model, assignedAgent, task_type, description, code);

    return NextResponse.json({
      success: true,
      task_id: taskId,
      assigned_to: {
        id: assignedAgent.id,
        name: assignedAgent.name,
        capabilities: assignedAgent.capabilities,
      },
      task_type,
      result,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

async function assignToBestAgent(turso: any, taskType: string, description: string) {
  // Get all junior dev agents
  const result = await turso.execute({
    sql: `SELECT id, name, capabilities, status FROM agents WHERE department_id = 'junior-dev-team' AND status = 'active'`,
  });

  const agents = result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    capabilities: JSON.parse(row.capabilities || '[]'),
    status: row.status,
  }));

  // Match task type to agent capabilities
  const taskTypeMap: Record<string, string[]> = {
    code_review: ['code_review', 'linting', 'best_practices'],
    bug_fix: ['bug_fixing', 'debugging', 'error_handling'],
    test: ['testing', 'unit_tests', 'integration_tests'],
    documentation: ['documentation', 'comments', 'readme'],
    refactor: ['refactoring', 'code_cleanup', 'optimization'],
  };

  const requiredCaps = taskTypeMap[taskType] || [];
  
  // Find best matching agent
  let bestAgent = agents[0];
  let bestScore = 0;

  for (const agent of agents) {
    const score = agent.capabilities.filter((cap: string) => 
      requiredCaps.some(req => cap.includes(req) || req.includes(cap))
    ).length;
    
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }

  return bestAgent;
}

async function workOnTask(openai: any, model: string, agent: any, taskType: string, description: string, code?: string) {
  const prompts: Record<string, string> = {
    code_review: `As a ${agent.name}, review this code and provide feedback:
${code || 'No code provided'}

Description: ${description}

Provide:
1. Code quality issues
2. Best practice violations
3. Potential bugs
4. Suggestions for improvement`,
    
    bug_fix: `As a ${agent.name}, fix this bug:
${code || 'No code provided'}

Description: ${description}

Provide:
1. The bug fix
2. Explanation of what was wrong
3. How to prevent similar bugs`,
    
    test: `As a ${agent.name}, write tests for this:
${code || 'No code provided'}

Description: ${description}

Provide:
1. Unit tests
2. Test cases to cover
3. Edge cases to test`,
    
    documentation: `As a ${agent.name}, document this code:
${code || 'No code provided'}

Description: ${description}

Provide:
1. Function/class documentation
2. Inline comments
3. README updates if needed`,
    
    refactor: `As a ${agent.name}, refactor this code:
${code || 'No code provided'}

Description: ${description}

Provide:
1. Refactored code
2. Improvements made
3. Performance optimizations`,
  };

  const prompt = prompts[taskType] || `As a ${agent.name}, work on this task: ${description}`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: `You are ${agent.name}, a junior developer. Capabilities: ${agent.capabilities.join(', ')}` },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    });

    return {
      completed: true,
      output: response.choices[0].message.content,
      agent: agent.name,
    };
  } catch (error) {
    return {
      completed: false,
      error: 'Failed to process task',
      agent: agent.name,
    };
  }
}
