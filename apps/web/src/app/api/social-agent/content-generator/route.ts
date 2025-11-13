import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  // Lazy-load clients inside handler (not at module load)
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const openai = createAIClient();
  const model = getAIModel(); // Uses free Gemini by default
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { prompt, platform, tone } = await request.json();

    const completion = await openai.chat.completions.create({
      model: model, // Free Gemini by default, upgrade to premium when monetized
      messages: [
        {
          role: 'system',
          content: `You are a social media content creator specializing in ${platform}. Create engaging, ${tone} content.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
