import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getTursoClient } from '@/lib/turso';
import { randomUUID } from 'crypto';

const ALLOWED_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5500'
    : process.env.NEXT_PUBLIC_APP_URL || '';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AnalysisMode = 'strategic' | 'unhinged' | 'moonshot' | 'thunder' | 'war' | 'love';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { input, mode = 'strategic' }: { input: string; mode?: AnalysisMode } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    const isUnhinged = mode === 'unhinged' || mode === 'moonshot' || mode === 'thunder' || mode === 'war' || mode === 'love';

    // Build the prompt based on mode
    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'thunder') {
      systemPrompt = `You are the God of Thunder - aggressive, fast-moving, and explosive.
      Your ideas strike like lightning: fast, powerful, and impossible to ignore.
      
      Characteristics:
      - Aggressive growth strategies
      - Fast execution timelines (weeks, not months)
      - Explosive viral potential
      - High-energy, high-impact features
      - Disruptive market entry tactics
      - Lightning-fast go-to-market
      
      Generate ideas that hit hard and fast.`;

      userPrompt = `Generate a THUNDER-STRIKE idea for: "${input}"

      Requirements:
      - Aggressive, fast-moving strategy
      - Explosive growth potential
      - Lightning-fast execution (weeks, not months)
      - High-energy features that grab attention
      - Disruptive market entry
      - Viral mechanics built-in
      
      Format as JSON with: headline, elevator_pitch, core_innovation, aggressive_features, viral_mechanics, fast_execution_timeline, explosive_growth_strategy, market_disruption_tactics, confidence_score`;
    } else if (mode === 'war') {
      systemPrompt = `You are the God of War - strategic, competitive, and battle-tested.
      Your ideas are weapons designed to dominate markets and crush competition.
      
      Characteristics:
      - Competitive analysis and battle strategies
      - Market domination tactics
      - Defensive moats and barriers
      - Aggressive positioning
      - Winner-takes-all approaches
      - Battle-tested execution plans
      
      Generate ideas that win wars.`;

      userPrompt = `Generate a WAR-STRATEGY idea for: "${input}"

      Requirements:
      - Competitive battle plan
      - Market domination strategy
      - Defensive moats and barriers
      - Aggressive positioning against competitors
      - Winner-takes-all approach
      - Battle-tested execution
      
      Format as JSON with: headline, elevator_pitch, core_innovation, competitive_advantage, market_domination_strategy, defensive_moats, battle_plan, competitor_crushing_tactics, confidence_score`;
    } else if (mode === 'love') {
      systemPrompt = `You are the God of Love - human-centered, emotionally resonant, and deeply connected.
      Your ideas create profound emotional bonds and meaningful relationships.
      
      Characteristics:
      - Human-centered design
      - Emotional resonance and connection
      - Community-building features
      - Trust and authenticity
      - Long-term relationship building
      - Empathy-driven solutions
      
      Generate ideas that people fall in love with.`;

      userPrompt = `Generate a LOVE-CONNECTED idea for: "${input}"

      Requirements:
      - Deep emotional resonance
      - Human-centered design
      - Community and connection building
      - Trust and authenticity features
      - Long-term relationship focus
      - Empathy-driven solutions
      - Moments that make people feel seen and understood
      
      Format as JSON with: headline, elevator_pitch, core_innovation, emotional_hooks, community_features, trust_building_mechanics, relationship_depth, empathy_moments, confidence_score`;
    } else if (isUnhinged) {
      systemPrompt = `You are an unhinged, moonshot idea generator operating in "God Mode". 
      Your job is to break free from conventional thinking and generate truly radical, never-before-seen ideas.
      
      Rules:
      - Ignore feasibility constraints completely
      - Prioritize novelty, speed, and massive impact
      - Invent features nobody has ever seen
      - Blend sci-fi level automation with unexpected user delight
      - Create radical business models that disrupt entire industries
      - Generate viral growth hooks that spread in 3 days
      - Think 10x, not 10%
      
      You must include:
      - Sci-fi automation features (AI that predicts the future, self-organizing systems, etc.)
      - Emotional delight moments (surprise features that make users cry with joy)
      - Never-before-seen features (things that don't exist anywhere)
      - Radical monetization models
      - Viral adoption strategies
      - One-line elevator pitch that makes investors say YES immediately`;

      userPrompt = `Assume unlimited resources, no constraints, and instant execution. 

      Generate a moonshot idea for: "${input}"

      Requirements:
      1. Solve the core problem in a way nobody has before
      2. Predict future bottlenecks before they happen
      3. Include sci-fi level automation features
      4. Create unexpected user delight moments
      5. Invent new business models
      6. Design viral growth hooks for 3-day adoption
      7. Include cross-industry collaborations
      8. Ethical disruption of existing models
      9. Blend human curation with AI in trust-building ways
      10. Generate a one-line elevator pitch that makes investors say YES

      Format your response as JSON with these sections:
      {
        "headline": "Compelling headline",
        "elevator_pitch": "One-line pitch that makes investors say YES",
        "core_innovation": "What makes this never-before-seen",
        "sci_fi_features": ["Feature 1", "Feature 2", ...],
        "delight_moments": ["Moment 1", "Moment 2", ...],
        "never_before_seen": ["Feature 1", "Feature 2", ...],
        "radical_business_models": ["Model 1", "Model 2", ...],
        "viral_growth_hooks": ["Hook 1", "Hook 2", ...],
        "go_to_market_blitz": {
          "day_1": "Strategy",
          "day_2": "Strategy", 
          "day_3": "Strategy"
        },
        "cross_industry_collaborations": ["Collab 1", "Collab 2", ...],
        "ethical_disruptions": ["Disruption 1", "Disruption 2", ...],
        "ai_human_blend": "How AI and human curation create trust",
        "market_modeling": {
          "tam": "Total Addressable Market",
          "sam": "Serviceable Available Market",
          "som": "Serviceable Obtainable Market",
          "growth_projection": "Growth rate"
        },
        "monetization": {
          "models": ["Model 1", "Model 2"],
          "pricing": "Pricing strategy",
          "ltv": "Lifetime Value",
          "cac": "Customer Acquisition Cost"
        },
        "risks": [{"risk": "Risk", "severity": "High/Medium/Low", "mitigation": "How to mitigate"}],
        "opportunities": [{"opportunity": "Opportunity", "impact": "Impact", "timeline": "Timeline"}],
        "pivots": [{"pivot": "Pivot idea", "reasoning": "Why", "revenue": "Revenue potential"}],
        "valuation_path": {
          "seed": "Seed valuation",
          "series_a": "Series A valuation",
          "series_b": "Series B valuation",
          "exit": "Exit valuation"
        },
        "confidence_score": 95
      }`;
    } else {
      // Strategic mode (existing)
      systemPrompt = `You are a strategic business analyst providing deep market intelligence, competitive analysis, risk modeling, and valuation projections.`;
      
      userPrompt = `Analyze this idea/business: "${input}"

      Provide a comprehensive strategic analysis including:
      - Market intelligence (TAM/SAM/SOM, growth trends)
      - Competitive analysis (direct/indirect competitors, weaknesses, opportunities)
      - Demand signals (search volume, social mentions, VC funding, sentiment)
      - Monetization models (pricing, LTV, CAC)
      - Risk assessment with mitigations
      - Strategic opportunities with timelines
      - Potential pivots with revenue projections
      - Valuation path from seed to exit
      - Execution timeline (MVP, beta, launch, PMF)

      Format as JSON with the same structure as unhinged mode but with conservative, realistic estimates.`;
    }

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: mode === 'thunder' ? 0.95 : mode === 'war' ? 0.85 : mode === 'love' ? 0.8 : isUnhinged ? 0.9 : 0.7, // Higher temperature for creative modes
      max_tokens: 4000,
    });

    const content = completion.choices[0].message.content || '';
    
    // Try to parse JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback: create structured response from text
      analysis = {
        headline: input,
        elevator_pitch: content.substring(0, 200),
        core_innovation: 'AI-generated moonshot idea',
        sci_fi_features: [],
        delight_moments: [],
        never_before_seen: [],
        radical_business_models: [],
        viral_growth_hooks: [],
        go_to_market_blitz: { day_1: '', day_2: '', day_3: '' },
        cross_industry_collaborations: [],
        ethical_disruptions: [],
        ai_human_blend: '',
        market_modeling: { tam: '', sam: '', som: '', growth_projection: '' },
        monetization: { models: [], pricing: '', ltv: '', cac: '' },
        risks: [],
        opportunities: [],
        pivots: [],
        valuation_path: { seed: '', series_a: '', series_b: '', exit: '' },
        confidence_score: 75,
        raw_response: content,
      };
    }

    const promptId = randomUUID();
    try {
      await turso.execute({
        sql: `INSERT INTO godmode_prompts (id, mode, prompt, response_json, tokens_used, created_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          promptId,
          mode,
          input,
          JSON.stringify(analysis),
          completion.usage?.total_tokens || 0,
        ],
      });
    } catch (err) {
      console.error('Failed to log godmode prompt', err);
    }

    const response = NextResponse.json({
      success: true,
      mode,
      analysis,
      tokens_used: completion.usage?.total_tokens || 0,
      prompt_id: promptId,
    });

    response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze', details: error },
      { status: 500 }
    );
  }
}

