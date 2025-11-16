import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate daily blog post automatically
 * Called by Vercel Cron or manually
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Verify this is called by Vercel Cron or has auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow manual calls without auth for testing
      const body = await request.json().catch(() => ({}));
      if (!body.manual && cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get Daily Blog Writer agent
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Daily Blog Writer%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Check if blog post already created today
    const today = new Date().toISOString().split('T')[0];
    const existingPost = await turso.execute({
      sql: `SELECT id FROM blog_posts WHERE DATE(created_at) = ? AND status = 'published'`,
      args: [today],
    });

    if (existingPost.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Daily blog post already created today',
        post_id: existingPost.rows[0].id,
      });
    }

    // Get trending topics or generate new one
    const topicsResult = await turso.execute({
      sql: `SELECT * FROM blog_topics WHERE status = 'pending' ORDER BY priority DESC, created_at DESC LIMIT 1`,
    });

    let topic = topicsResult.rows[0];
    let topicTitle = 'AI, Startups, and Building Products That Work';

    if (topic) {
      const topicTitleValue = topic.topic_title;
      if (topicTitleValue !== undefined && topicTitleValue !== null) {
        topicTitle = String(topicTitleValue);
      }
    } else {
      // Generate a new topic
      const topicPrompt = `Generate a compelling blog post topic for a tech/AI/startup blog. 
      The topic should be:
      - Relevant to AI, startups, product development, or entrepreneurship
      - Engaging and valuable to founders, developers, and product builders
      - SEO-friendly
      
      Return ONLY the topic title, nothing else.`;

      const topicCompletion = await openai.chat.completions.create({
        model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a content strategist. Generate engaging blog post topics.',
          },
          { role: 'user', content: topicPrompt },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      topicTitle = topicCompletion.choices[0].message.content?.trim() || topicTitle;
    }

    // Generate blog post content
    const blogPrompt = `Write a comprehensive, engaging blog post with the following requirements:

Title: ${topicTitle}

Requirements:
- Write 800-1200 words
- Include an engaging introduction that hooks the reader
- Use clear headings and subheadings
- Include practical insights, examples, or actionable advice
- End with a strong conclusion
- Write in a professional but accessible tone
- Focus on AI, startups, product development, or entrepreneurship
- Make it valuable and shareable

Format the response as JSON with:
{
  "title": "Blog Post Title",
  "excerpt": "2-3 sentence excerpt",
  "content": "Full blog post content in markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "seo_keywords": "comma-separated keywords",
  "seo_description": "SEO meta description"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert blog writer specializing in AI, startups, and product development. Write engaging, valuable content.',
        },
        { role: 'user', content: blogPrompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || '';
    let blogData;
    try {
      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback: parse manually
      blogData = {
        title: topicTitle,
        excerpt: content.substring(0, 200) + '...',
        content: content,
        tags: ['AI', 'Startups', 'Product Development'],
        seo_keywords: 'AI, startups, product development',
        seo_description: content.substring(0, 160),
      };
    }

    // Generate slug
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Calculate read time (average 200 words per minute)
    const wordCount = blogData.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Save blog post
    const postId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO blog_posts (id, title, slug, excerpt, content, author, status, published_at, read_time_minutes, tags, seo_keywords, seo_description, created_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'published', datetime('now'), ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        postId,
        blogData.title,
        slug,
        blogData.excerpt,
        blogData.content,
        'Why.ai Blog Team',
        readTime,
        JSON.stringify(blogData.tags || []),
        blogData.seo_keywords || '',
        blogData.seo_description || '',
        agentId,
      ],
    });

    // Update topic status if used
    if (topic) {
      await turso.execute({
        sql: `UPDATE blog_topics SET status = 'completed', updated_at = datetime('now') WHERE id = ?`,
        args: [topic.id],
      });
    }

    // Log activity
    if (agentId) {
      await turso.execute({
        sql: `INSERT INTO bot_activity (id, agent_id, activity_type, details, created_at)
              VALUES (?, ?, 'blog_post_created', ?, datetime('now'))`,
        args: [randomUUID(), agentId, JSON.stringify({ post_id: postId, title: blogData.title })],
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: postId,
        title: blogData.title,
        slug,
        excerpt: blogData.excerpt,
        read_time_minutes: readTime,
        tags: blogData.tags,
      },
      message: 'Daily blog post generated successfully',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to generate daily blog post', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

