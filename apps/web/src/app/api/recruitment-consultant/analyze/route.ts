import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const { target_revenue, target_timeline_months, focus_areas } = await request.json();

    // Fetch all departments and their agents
    const departmentsResult = await turso.execute({
      sql: `SELECT d.id, d.name, d.description, COUNT(a.id) as agent_count
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            WHERE d.status = 'active'
            GROUP BY d.id, d.name, d.description`,
    });

    const departments = departmentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      agent_count: row.agent_count,
    }));

    // Fetch all agents and their capabilities
    const agentsResult = await turso.execute({
      sql: `SELECT id, name, department_id, capabilities, config, metadata, status
            FROM agents
            WHERE status = 'active'`,
    });

    const agents = agentsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      department_id: row.department_id,
      capabilities: JSON.parse(String(row.capabilities || '[]')),
      config: JSON.parse(String(row.config || '{}')),
      metadata: JSON.parse(String(row.metadata || '{}')),
      status: row.status,
    }));

    // Analyze skill gaps and recommend hires
    const prompt = `You are a Recruitment Consultant analyzing an AI Company Builder platform.

Current Platform State:
- Departments: ${departments.length}
- Total AI Agents: ${agents.length}
- Departments: ${departments.map((d: any) => `${d.name} (${d.agent_count} agents)`).join(', ')}

Target Goals:
- Target Revenue: £${target_revenue || '1M'} ARR
- Target Timeline: ${target_timeline_months || 12} months
- Focus Areas: ${focus_areas || 'all'}

Analyze the platform and provide:
1. Skill gaps that require human hires (legal, partnerships, leadership, compliance, sales, marketing, etc.)
2. Recommended roles with:
   - Role title
   - Type (full_time, part_time, fractional, contractor, consultant, freelance)
   - Urgency (low, medium, high, critical)
   - Priority score (0-100)
   - Required skills
   - Cost estimate (min/max in GBP)
   - Revenue impact forecast
   - Timeline (weeks to hire)
   - Impact description

3. Prioritized hiring order to support revenue, trust, and robustness

Format as JSON:
{
  "skill_gaps": ["gap1", "gap2"],
  "recommendations": [
    {
      "role_title": "Enterprise Sales Lead",
      "role_type": "fractional",
      "urgency": "high",
      "priority_score": 85,
      "required_skills": ["enterprise_sales", "b2b_sales", "crm"],
      "cost_estimate_min": 5000,
      "cost_estimate_max": 10000,
      "cost_currency": "GBP",
      "revenue_impact": 200000,
      "timeline_weeks": 4,
      "impact_forecast": "Adding Enterprise Lead boosts enterprise close-rate by 30%, enabling £200k ARR from 2-3 enterprise clients"
    }
  ],
  "hiring_plan": {
    "total_cost_estimate": 50000,
    "total_revenue_impact": 1000000,
    "priority_order": ["role1", "role2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Recruitment Consultant specializing in AI companies and autonomous platforms. Provide actionable, quantified hiring recommendations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const analysisContent = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisContent);

    // Save recommendations to database
    const recommendationIds = [];
    for (const rec of analysis.recommendations || []) {
      const recId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO recruitment_recommendations 
              (id, role_title, role_type, urgency, priority_score, required_skills, 
               cost_estimate_min, cost_estimate_max, cost_currency, revenue_impact, 
               timeline_weeks, impact_forecast, status, metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          recId,
          rec.role_title,
          rec.role_type || 'fractional',
          rec.urgency || 'medium',
          rec.priority_score || 50,
          JSON.stringify(rec.required_skills || []),
          rec.cost_estimate_min || 0,
          rec.cost_estimate_max || 0,
          rec.cost_currency || 'GBP',
          rec.revenue_impact || 0,
          rec.timeline_weeks || 4,
          rec.impact_forecast || '',
          'recommended',
          JSON.stringify({ skill_gaps: analysis.skill_gaps || [] }),
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      });
      recommendationIds.push(recId);
    }

    // Create hiring plan
    const planId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO recruitment_hiring_plan 
            (id, plan_name, target_revenue, target_timeline_months, recommendations, 
             total_cost_estimate, total_revenue_impact, status, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        planId,
        `Hiring Plan for £${target_revenue || '1M'} ARR`,
        target_revenue || 1000000,
        target_timeline_months || 12,
        JSON.stringify(recommendationIds),
        analysis.hiring_plan?.total_cost_estimate || 0,
        analysis.hiring_plan?.total_revenue_impact || 0,
        'draft',
        JSON.stringify({ priority_order: analysis.hiring_plan?.priority_order || [] }),
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      analysis: {
        skill_gaps: analysis.skill_gaps || [],
        recommendations: analysis.recommendations || [],
        hiring_plan: analysis.hiring_plan || {},
      },
      plan_id: planId,
      recommendation_ids: recommendationIds,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

