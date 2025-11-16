import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze Christmas trends and identify high-commission Amazon products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, max_commission_rate, min_trend_score } = body;

    const prompt = `You are a Christmas trend analyst and Amazon affiliate expert. 
    Identify the TOP 10 trending Christmas products for 2024 that have:
    1. High Amazon affiliate commission rates (5%+)
    2. Strong seasonal relevance (Christmas-specific)
    3. High viral/social media potential
    4. Good price points for impulse buying (£10-£100)
    5. Low to medium competition
    6. Strong search volume
    
    Focus on products that:
    - Are trending on TikTok, Instagram, YouTube
    - Have "gift" appeal
    - Are shareable/Instagrammable
    - Solve common Christmas problems
    - Create emotional connections
    
    For each product, provide:
    - Product name
    - Category
    - Estimated Amazon commission rate (%)
    - Estimated commission per sale (£)
    - Trend score (0-100)
    - Search volume estimate
    - Competition level (low/medium/high)
    - Price range
    - Target audience
    - Seasonal relevance (0-100)
    - Viral potential (0-100)
    - 5 content ideas for promoting it
    - 3 YouTube video ideas
    
    Format as JSON array of products.`;

    const completion = await openai.chat.completions.create({
      model: process.env.USE_PREMIUM_AI === 'true' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at identifying trending Christmas products with high Amazon affiliate commission potential. Focus on viral, shareable, gift-worthy items.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content || '';
    
    let products;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found');
      }
    } catch {
      // Fallback: create sample products
      products = [
        {
          product_name: 'AI-Powered Smart Christmas Lights',
          category: 'Home Decor',
          estimated_commission_rate: 8.5,
          estimated_commission_per_sale: 4.25,
          trend_score: 92,
          search_volume: 45000,
          competition_level: 'medium',
          price_range: '£30-£50',
          target_audience: 'Tech-savvy millennials, homeowners',
          seasonal_relevance: 100,
          viral_potential: 95,
          content_ideas: [
            'TikTok video showing color-changing lights synced to music',
            'Instagram Reel: "Before/After" home transformation',
            'YouTube: "Smart Home Christmas Setup" tutorial',
            'Blog post: "10 Ways to Use Smart Lights This Christmas"',
            'Pinterest: "Christmas Light Ideas" board',
          ],
          youtube_video_ideas: [
            'Unboxing & Setup: Smart Christmas Lights Review',
            'Gift Guide: Best Tech Gifts Under £50',
            'Home Tour: Christmas Decor with Smart Tech',
          ],
        },
      ];
    }

    return NextResponse.json({
      success: true,
      products,
      total_products: products.length,
      estimated_total_commission: products.reduce((sum: number, p: any) => sum + (p.estimated_commission_per_sale || 0), 0),
      tokens_used: completion.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze Christmas trends' },
      { status: 500 }
    );
  }
}

