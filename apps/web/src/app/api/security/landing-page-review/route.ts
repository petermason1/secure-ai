import { NextRequest, NextResponse } from 'next/server';
import { createAIClient, getAIModel } from '@/lib/openai-client';

/**
 * Security Team Review of Landing Page and Privacy
 * Asks security team to review the landing page approach and privacy measures
 */
export async function POST(request: NextRequest) {
  try {
    const openai = createAIClient();
    const model = getAIModel();

    const { question } = await request.json();

    const prompt = `You are the Security Team for an AI Company Builder platform.

QUESTION: ${question || 'Should we create a public landing page that links to individual features? How do we keep code and ideas private?'}

CURRENT SITUATION:
- Platform has 20+ AI departments (HR, Legal, Sales, Marketing, etc.)
- All code and business logic should remain private
- Need to showcase features without exposing proprietary information
- Landing page should link to individual feature pages
- Dashboard and internal tools require authentication

Provide security advisory covering:
1. What should be public vs private on landing page
2. How to protect code and ideas from exposure
3. Access control recommendations
4. API security for public endpoints
5. Data privacy measures
6. Compliance considerations
7. Specific recommendations for landing page structure

Format as JSON:
{
  "risk_assessment": "low|medium|high",
  "public_should_show": ["list of safe public features"],
  "must_keep_private": ["code", "business logic", "proprietary ideas", "etc"],
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "action": "specific action",
      "reason": "why",
      "implementation": "how to implement"
    }
  ],
  "access_control_strategy": "strategy description",
  "api_security": ["recommendation1", "recommendation2"],
  "compliance_check": ["GDPR", "SOC2", "etc"]
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Security Team providing comprehensive security advisory. Focus on protecting proprietary code, ideas, and business logic while allowing safe public feature showcasing.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const advisoryContent = completion.choices[0]?.message?.content || '{}';
    const advisory = JSON.parse(advisoryContent);

    return NextResponse.json({
      success: true,
      advisory,
      timestamp: new Date().toISOString(),
      message: 'Security team review completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

