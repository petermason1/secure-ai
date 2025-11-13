import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CONTENT_SYSTEM_PROMPT = `You are a social media content expert. Generate engaging, platform-appropriate content.

Rules:
- Twitter: 280 chars max, use emojis, hashtags (2-3 max), conversational
- LinkedIn: Professional, 1-2 paragraphs, industry insights, no hashtags overload
- Instagram: Visual-first, caption with line breaks, 5-10 hashtags, storytelling

Always:
- Match the brand voice
- Include a clear CTA
- Use platform-specific best practices
- Be authentic and valuable`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_type, source_data, platforms = ['twitter', 'linkedin'], client_id } = body;

    if (!source_type || !source_data) {
      return NextResponse.json(
        { error: 'source_type and source_data are required' },
        { status: 400 }
      );
    }

    // Get brand voice for client
    const { data: brandVoice } = await supabase
      .from('brand_voice')
      .select('*')
      .eq('client_id', client_id || 'default')
      .single();

    const brandContext = brandVoice
      ? `Brand tone: ${brandVoice.tone}. Guidelines: ${brandVoice.guidelines}`
      : 'Brand tone: Professional and technical. Focus on value and results.';

    // Generate content for each platform
    const generatedPosts = await Promise.all(
      platforms.map(async (platform: string) => {
        const userPrompt = `Generate a ${platform} post for this event:

Source: ${source_type}
Details: ${JSON.stringify(source_data)}

${brandContext}

Generate engaging content that highlights the value and includes a CTA.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: CONTENT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 300
        });

        const content = completion.choices[0]?.message?.content || '';

        // Store in database
        const { data: post, error } = await supabase
          .from('social_posts')
          .insert({
            client_id: client_id || 'default',
            platform,
            content,
            status: 'draft',
            source_type,
            source_id: source_data.id || null
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to store post:', error);
          return { platform, content, stored: false, error: error.message };
        }

        return { platform, content, stored: true, post_id: post.id };
      })
    );

    return NextResponse.json({
      success: true,
      generated_count: generatedPosts.length,
      posts: generatedPosts
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
