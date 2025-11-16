import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate sellable content for Christmas trend products
 * Creates YouTube scripts, blog posts, social media content, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_name, product_category, content_type = 'youtube_script', include_affiliate_links = true } = body;

    if (!product_name) {
      return NextResponse.json(
        { error: 'product_name is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    let systemPrompt = '';

    if (content_type === 'youtube_script') {
      systemPrompt = `You are a YouTube content creator expert at creating viral, engaging videos that drive Amazon affiliate sales.
      Your scripts are optimized for:
      - High watch time
      - Strong engagement (likes, comments, shares)
      - Natural affiliate link placement
      - SEO optimization
      - Call-to-action for purchases`;
      
      prompt = `Create a complete YouTube video script for: "${product_name}" (Category: ${product_category || 'Christmas Gift'})

      Requirements:
      - 8-12 minute video length
      - Hook viewers in first 15 seconds
      - Include natural product demonstrations
      - Place Amazon affiliate links strategically (mention them naturally)
      - Include call-to-action for viewers to check links in description
      - Optimize for YouTube SEO (include target keywords naturally)
      - Create emotional connection with Christmas/gift-giving
      - Make it shareable and engaging
      
      Format as JSON:
      {
        "video_title": "Compelling, SEO-optimized title",
        "video_description": "Full description with affiliate links",
        "tags": ["tag1", "tag2", ...],
        "script": {
          "hook": "First 15 seconds",
          "intro": "Introduction section",
          "main_content": "Main body with product features",
          "affiliate_mention": "Natural mention of affiliate links",
          "outro": "Closing with call-to-action"
        },
        "affiliate_links": [
          {"text": "Link text", "url": "amazon.co.uk/..."}
        ],
        "thumbnail_concept": "Description of thumbnail design",
        "estimated_views": 50000,
        "estimated_revenue": 250.00
      }`;
    } else if (content_type === 'blog_post') {
      systemPrompt = `You are a blog content writer specializing in Christmas gift guides and product reviews that convert readers into buyers.`;
      
      prompt = `Write a complete blog post about: "${product_name}"
      
      Requirements:
      - 1500-2000 words
      - SEO optimized
      - Natural affiliate link placement
      - Gift guide format
      - Include "Why This Makes a Great Gift" section
      - Add comparison with alternatives
      - Strong call-to-action
      
      Format as JSON with: title, content (full HTML), meta_description, keywords, affiliate_links`;
    } else if (content_type === 'social_media') {
      systemPrompt = `You are a social media content creator who creates viral posts that drive Amazon sales.`;
      
      prompt = `Create social media content for: "${product_name}"
      
      Create:
      - 3 TikTok video concepts (with hooks)
      - 5 Instagram post captions (with hashtags)
      - 3 Twitter/X threads
      - 2 Pinterest pin descriptions
      
      All optimized for driving clicks to Amazon affiliate links.`;
    }

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content || '';
    
    let generatedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        generatedContent = { raw_content: content };
      }
    } catch {
      generatedContent = { raw_content: content };
    }

    return NextResponse.json({
      success: true,
      content_type,
      product_name,
      content: generatedContent,
      tokens_used: completion.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

