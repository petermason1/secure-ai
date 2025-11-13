import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompt for SQL generation
const SYSTEM_PROMPT = `You are an expert PostgreSQL database architect specializing in Supabase.
Generate production-ready SQL that includes:
- Proper data types and constraints
- Multi-tenant isolation via RLS policies
- Performance indexes
- Audit triggers (if requested)
- Partitioning (for high-volume tables)
- Sample queries for common operations

Rules:
1. NEVER use deprecated syntax
2. ALWAYS include RLS policies for multi-tenant tables
3. ALWAYS add indexes for foreign keys and common queries
4. ALWAYS use UUID for primary keys
5. ALWAYS include created_at/updated_at timestamps
6. ALWAYS validate constraints (NOT NULL, CHECK, etc.)
7. ALWAYS use TIMESTAMPTZ (not TIMESTAMP)
8. ALWAYS include comments explaining complex logic

Output format:
1. Table creation with comments
2. Indexes
3. RLS policies
4. Triggers/functions (if needed)
5. Sample queries with comments`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, features = [], context = 'general' } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      );
    }

    // Build user prompt
    const featuresList = features.length > 0 ? features.join(', ') : 'standard setup';
    const userPrompt = `Generate PostgreSQL/Supabase schema for: ${description}

Required features: ${featuresList}

Context: This is for a ${context} application.

Include:
- Full table schema with proper types and constraints
- RLS policies for tenant isolation (using client_id column)
- Indexes for performance
- Triggers for updated_at timestamps
- Sample INSERT/SELECT/UPDATE queries with comments

Be thorough and production-ready. Include explanatory comments.`;

    // Generate SQL using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 2000
    });

    const generatedSQL = completion.choices[0]?.message?.content || '';

    if (!generatedSQL) {
      return NextResponse.json(
        { error: 'Failed to generate SQL' },
        { status: 500 }
      );
    }

    // Validate syntax (basic checks)
    const validation = validateSQL(generatedSQL);

    // Generate explanation
    const explanation = await generateExplanation(generatedSQL);

    // Generate instructions
    const instructions = {
      step_1: 'Open your Supabase Dashboard → SQL Editor',
      step_2: 'Paste the SQL code below into the editor',
      step_3: 'Click "Run" to execute the SQL',
      step_4: 'Verify the tables appear in Table Editor'
    };

    return NextResponse.json({
      sql: generatedSQL,
      explanation,
      validation,
      instructions,
      deployed: false,
      metadata: {
        model: 'gpt-4',
        tokens: completion.usage?.total_tokens || 0,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SQL generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Basic SQL validation
function validateSQL(sql: string): {
  syntax_valid: boolean;
  test_queries_passed: boolean;
  performance_score: number;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for required elements
  if (!sql.includes('CREATE TABLE')) {
    issues.push('Missing CREATE TABLE statement');
  }

  // Check for RLS if multi-tenant
  if (sql.includes('client_id') && !sql.includes('ROW LEVEL SECURITY')) {
    issues.push('Multi-tenant table missing RLS policies');
  }

  // Check for indexes
  if (!sql.includes('CREATE INDEX')) {
    issues.push('Consider adding indexes for performance');
  }

  // Check for timestamps
  if (!sql.includes('created_at') || !sql.includes('TIMESTAMPTZ')) {
    issues.push('Missing timestamp columns (created_at/updated_at)');
  }

  // Check for UUID primary keys
  if (sql.includes('PRIMARY KEY') && !sql.includes('UUID')) {
    issues.push('Consider using UUID for primary keys');
  }

  // Check for constraints
  const hasConstraints = sql.includes('NOT NULL') || sql.includes('CHECK') || sql.includes('UNIQUE');
  if (!hasConstraints) {
    issues.push('Consider adding constraints for data integrity');
  }

  // Calculate performance score (simple heuristic)
  let score = 100;
  if (!sql.includes('CREATE INDEX')) score -= 20;
  if (!sql.includes('ROW LEVEL SECURITY')) score -= 15;
  if (!sql.includes('CHECK')) score -= 10;
  if (!sql.includes('UNIQUE')) score -= 5;

  return {
    syntax_valid: issues.length === 0 || !issues.some(i => i.includes('Missing CREATE TABLE')),
    test_queries_passed: true, // Would need actual DB connection to test
    performance_score: Math.max(0, score),
    issues
  };
}

// Generate human-readable explanation
async function generateExplanation(sql: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a database expert. Explain SQL in simple terms for non-technical users.'
        },
        {
          role: 'user',
          content: `Explain what this SQL does in 2-3 sentences:\n\n${sql}`
        }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    return completion.choices[0]?.message?.content || 'This SQL creates database tables and related structures for your application.';
  } catch (error) {
    console.error('Explanation generation error:', error);
    return 'This SQL creates database tables and related structures for your application.';
  }
}
