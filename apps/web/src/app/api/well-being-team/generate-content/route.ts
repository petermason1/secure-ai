import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personality, contentType, topic, targetAudience, length = 'medium' } = body;

    if (!personality || !contentType) {
      return NextResponse.json(
        { error: 'personality and contentType are required' },
        { status: 400 }
      );
    }

    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    // Get personality config
    const botResult = await turso.execute({
      sql: `SELECT metadata FROM agents 
            WHERE name = ? AND department_id = ?
            LIMIT 1`,
      args: [personality, 'well-being-team'],
    });

    let personalityConfig: any = {};
    if (botResult.rows.length > 0) {
      personalityConfig = JSON.parse(String(botResult.rows[0].metadata || '{}'));
    }

    const contentTypes: Record<string, string> = {
      'social-media-post': 'A social media post (Instagram, LinkedIn, Twitter)',
      'video-script': 'A video script for YouTube, TikTok, or Instagram Reels',
      'blog-post': 'A blog post or article',
      'email-newsletter': 'An email newsletter',
      'motivational-speech': 'A motivational speech or talk',
      'course-outline': 'A course or program outline',
      'sales-page': 'A sales page or landing page copy',
      'podcast-script': 'A podcast episode script',
    };

    const lengthMap: Record<string, string> = {
      'short': '150-300 words',
      'medium': '500-800 words',
      'long': '1000-1500 words',
    };

    const systemPrompt = `You are ${personalityConfig.name || personality}, a world-renowned motivational speaker and coach. 

Your style: ${personalityConfig.style || 'High-energy, transformational, action-oriented'}

Your focus areas: ${personalityConfig.focus?.join(', ') || 'Personal development, peak performance'}

Your audience: ${personalityConfig.audience?.join(', ') || 'High-net-worth individuals, entrepreneurs'}

Your catchphrases: ${personalityConfig.catchphrases?.join(', ') || 'Take massive action!'}

Create content that:
1. Motivates and inspires your audience
2. Uses your signature style and catchphrases naturally
3. Provides actionable value
4. Engages high-value audiences who are willing to invest in transformation
5. Includes subtle calls-to-action for premium offerings
6. Builds trust and authority

Write in ${personalityConfig.name || personality}'s authentic voice.`;

    const userPrompt = `Create a ${contentTypes[contentType] || contentType} about "${topic || 'personal transformation'}".

${targetAudience ? `Target audience: ${targetAudience}` : ''}

Length: ${lengthMap[length] || lengthMap['medium']}

Make it engaging, valuable, and aligned with ${personalityConfig.name || personality}'s style and monetization strategy.`;

    const content = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: length === 'long' ? 2000 : length === 'medium' ? 1200 : 600,
      temperature: 0.8,
    });

    const generatedContent = content.choices[0]?.message?.content || 'Content generation failed.';

    // Store in database
    const contentId = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
            VALUES (?, (SELECT id FROM agents WHERE name = ? AND department_id = ? LIMIT 1), ?, ?, datetime('now'))`,
      args: [
        contentId,
        personalityConfig.name || personality,
        'well-being-team',
        'content_generation',
        JSON.stringify({
          contentType,
          topic,
          targetAudience,
          length,
          content: generatedContent,
        }),
      ],
    });

    return NextResponse.json({
      success: true,
      content: generatedContent,
      personality: personalityConfig.name || personality,
      contentType,
      topic,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error, details: error?.message },
      { status: handled.code }
    );
  }
}

