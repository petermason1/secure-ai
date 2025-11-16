import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { source, title, url, publication, sentiment, mention_date } = body;

    if (!source || !title) {
      return NextResponse.json(
        { error: 'source and title are required' },
        { status: 400 }
      );
    }

    const { data: mention, error } = await supabase
      .from('media_mentions')
      .insert({
        source,
        title,
        url: url || null,
        author: null,
        publication: publication || null,
        mention_date: mention_date || new Date().toISOString().split('T')[0],
        sentiment: sentiment || 'neutral',
        reach: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mention,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const sentiment = searchParams.get('sentiment');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('media_mentions')
      .select('*')
      .order('mention_date', { ascending: false })
      .limit(limit);

    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }

    const { data: mentions, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mentions: mentions || [],
      total: mentions?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


