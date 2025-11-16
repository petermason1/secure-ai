import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { query, search_type = 'both', filters } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    let queryBuilder = supabase
      .from('file_storage')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_archived', false);

    // Apply filters
    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters?.date_range) {
      if (filters.date_range.start) {
        queryBuilder = queryBuilder.gte('uploaded_at', filters.date_range.start);
      }
      if (filters.date_range.end) {
        queryBuilder = queryBuilder.lte('uploaded_at', filters.date_range.end);
      }
    }

    // Keyword search
    if (search_type === 'keyword' || search_type === 'both') {
      queryBuilder = queryBuilder.or(`file_name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: files, error } = await queryBuilder;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Simple relevance scoring (in production, would use semantic search with embeddings)
    const results = (files || []).map((file: any) => {
      const nameMatch = file.file_name.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0;
      const tagMatch = file.tags?.some((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      ) ? 0.2 : 0;
      const categoryMatch = file.category?.toLowerCase().includes(query.toLowerCase()) ? 0.1 : 0;
      
      return {
        file_id: file.id,
        file_name: file.file_name,
        relevance_score: nameMatch + tagMatch + categoryMatch + 0.4, // Base score
        snippet: file.description || `File: ${file.file_name}`,
        tags: file.tags || [],
        category: file.category,
        uploaded_at: file.uploaded_at,
      };
    }).sort((a: any, b: any) => b.relevance_score - a.relevance_score);

    return NextResponse.json({
      results: results.slice(0, 20), // Top 20 results
      suggestions: generateSuggestions(query, results),
      total: results.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSuggestions(query: string, results: any[]): string[] {
  const suggestions: string[] = [];
  
  // Extract potential company names
  const companyMatch = query.match(/(\w+)\s+(corp|inc|llc|ltd)/i);
  if (companyMatch) {
    suggestions.push(`Did you mean ${companyMatch[0]}?`);
  }
  
  // Extract year
  const yearMatch = query.match(/\d{4}/);
  if (yearMatch) {
    suggestions.push(`Files from ${yearMatch[0]}`);
  }
  
  return suggestions;
}

