import { NextRequest, NextResponse } from 'next/server';

const TLDS = ['.com', '.io', '.ai', '.co', '.app', '.dev', '.tech', '.xyz', '.net', '.org'];

async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      }
    );
    
    const data = await response.json();
    return !data.Answer || data.Answer.length === 0 || data.Status === 3;
  } catch (error) {
    return false;
  }
}

function generateSuggestions(baseName: string): string[] {
  const prefixes = ['get', 'try', 'use', 'my', 'the', 'go', 'hey'];
  const suffixes = ['app', 'hq', 'hub', 'io', 'ai', 'pro', 'labs', 'tech', 'dev'];
  
  const suggestions: string[] = [];
  
  TLDS.forEach(tld => {
    suggestions.push(`${baseName}${tld}`);
  });
  
  prefixes.forEach(prefix => {
    suggestions.push(`${prefix}${baseName}.com`);
    suggestions.push(`${prefix}${baseName}.io`);
  });
  
  suffixes.forEach(suffix => {
    suggestions.push(`${baseName}${suffix}.com`);
    suggestions.push(`${baseName}${suffix}.io`);
  });
  
  return [...new Set(suggestions)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanQuery.length < 2) {
      return NextResponse.json(
        { error: 'query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const suggestions = generateSuggestions(cleanQuery);
    const topSuggestions = suggestions.slice(0, 20);
    
    const results = await Promise.all(
      topSuggestions.map(async (domain) => {
        const available = await checkDomainAvailability(domain);
        return {
          domain,
          available,
          registrar_url: `https://www.namecheap.com/domains/registration/results/?domain=${domain}`
        };
      })
    );

    const sorted = results.sort((a, b) => {
      if (a.available !== b.available) {
        return a.available ? -1 : 1;
      }
      const preferredTlds = ['.com', '.io', '.ai'];
      const aScore = preferredTlds.findIndex(tld => a.domain.endsWith(tld));
      const bScore = preferredTlds.findIndex(tld => b.domain.endsWith(tld));
      if (aScore !== -1 && bScore === -1) return -1;
      if (aScore === -1 && bScore !== -1) return 1;
      return 0;
    });

    return NextResponse.json({
      query: cleanQuery,
      total_checked: results.length,
      available_count: results.filter(r => r.available).length,
      results: sorted
    });

  } catch (error) {
    console.error('Domain check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
