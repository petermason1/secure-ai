import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze company for instant value-adding opportunities
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { company_info, current_revenue, current_profit, current_margin, sector } = body;

    if (!company_info) {
      return NextResponse.json(
        { error: 'company_info is required' },
        { status: 400 }
      );
    }

    // Get Value Optimization Bot
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Value Optimization%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Use AI to analyze opportunities
    const analysisPrompt = `As a Value Optimization expert, analyze this company for opportunities to add £1M+ in value instantly:

Company Info: ${company_info}
${current_revenue ? `Current Revenue: £${current_revenue}` : ''}
${current_profit ? `Current Profit: £${current_profit}` : ''}
${current_margin ? `Current Margin: ${current_margin}%` : ''}
${sector ? `Sector: ${sector}` : ''}

Analyze for these 8 instant value-adding opportunities:

1. PROFIT ADJUSTMENT: Can owner salary be replaced with market rate? Any one-off expenses to remove?
2. GROSS MARGIN IMPROVEMENT: Pricing optimization, cost reduction, bundling opportunities?
3. REVENUE GROWTH DEMONSTRATION: Recent growth data, contracts, sustainable growth above sector average?
4. IP PROTECTION: Patents, trademarks, copyrights that can be filed?
5. FINANCIAL AUDIT: Are accounts clean and audited? Can we get audited financials?
6. TIER 1 CUSTOMER: Can we identify and sign a flagship client?
7. TIER 1 INVESTOR: Can we attract an institutional investor?
8. PR/MEDIA WINS: Viral press features, thought leadership, awards?

For each applicable opportunity, provide:
- opportunity_type
- title
- description
- estimated_value_impact (in £)
- confidence_score (0-1)
- effort_level (low/medium/high/very_high)
- time_to_complete_days
- priority (low/medium/high/critical)

Format as JSON array:
[
  {
    "opportunity_type": "profit_adjustment",
    "title": "...",
    "description": "...",
    "estimated_value_impact": 500000,
    "confidence_score": 0.8,
    "effort_level": "medium",
    "time_to_complete_days": 30,
    "priority": "high"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Value Optimization expert specializing in actions that can add £1M+ in company value instantly. Analyze companies and identify specific, actionable opportunities.',
        },
        { role: 'user', content: analysisPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const opportunities = response.opportunities || [];

    // Save opportunities
    const savedOpportunities = [];
    for (const opp of opportunities) {
      const oppId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO value_opportunities (id, opportunity_type, title, description, estimated_value_impact, confidence_score, effort_level, time_to_complete_days, priority, status, assigned_agent_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'identified', ?, datetime('now'), datetime('now'))`,
        args: [
          oppId,
          opp.opportunity_type,
          opp.title,
          opp.description,
          opp.estimated_value_impact || 0,
          opp.confidence_score || 0.5,
          opp.effort_level || 'medium',
          opp.time_to_complete_days || 30,
          opp.priority || 'medium',
          agentId,
        ],
      });
      savedOpportunities.push({ id: oppId, ...opp });
    }

    // Calculate total potential value
    const totalValue = savedOpportunities.reduce((sum, opp) => sum + (opp.estimated_value_impact || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Found ${savedOpportunities.length} value-adding opportunities`,
      total_potential_value: totalValue,
      opportunities: savedOpportunities,
      summary: {
        profit_adjustments: savedOpportunities.filter(o => o.opportunity_type === 'profit_adjustment').length,
        margin_improvements: savedOpportunities.filter(o => o.opportunity_type === 'gross_margin_improvement').length,
        ip_protections: savedOpportunities.filter(o => o.opportunity_type === 'ip_protection').length,
        tier1_relationships: savedOpportunities.filter(o => o.opportunity_type === 'tier1_customer' || o.opportunity_type === 'tier1_investor').length,
        pr_wins: savedOpportunities.filter(o => o.opportunity_type === 'pr_media_win').length,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to analyze opportunities', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

