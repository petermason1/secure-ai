import { NextRequest, NextResponse } from 'next/server';

import { turso, handleTursoError } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    // Check env vars first
    const hasUrl = !!process.env.TURSO_DATABASE_URL;
    const hasToken = !!process.env.TURSO_AUTH_TOKEN;
    
    if (!hasUrl || !hasToken) {
      return NextResponse.json({
        error: 'Missing Turso environment variables',
        details: {
          hasUrl,
          hasToken,
          message: hasUrl 
            ? 'TURSO_AUTH_TOKEN is missing. Get it from Vercel Dashboard → Storage → Turso Database'
            : 'TURSO_DATABASE_URL is missing. Check your .env.local file',
        },
      }, { status: 500 });
    }
    
    // Test connection
    const result = await turso.execute('SELECT 1 as test');
    
    return NextResponse.json({
      success: true,
      message: 'Turso connected successfully!',
      data: result,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { 
        error: handled.error, 
        code: handled.code,
        details: error.message,
      },
      { status: handled.code }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check env vars first
    const hasUrl = !!process.env.TURSO_DATABASE_URL;
    const hasToken = !!process.env.TURSO_AUTH_TOKEN;
    
    if (!hasUrl || !hasToken) {
      return NextResponse.json({
        error: 'Missing Turso environment variables',
        details: {
          hasUrl,
          hasToken,
          message: hasUrl 
            ? 'TURSO_AUTH_TOKEN is missing. Get it from Vercel Dashboard → Storage → Turso Database'
            : 'TURSO_DATABASE_URL is missing. Check your .env.local file',
        },
      }, { status: 500 });
    }
    
    // Example: Create a table (if it doesn't exist)
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    
    // Example: Insert a todo
    await turso.execute({
      sql: 'INSERT INTO todos (id, description) VALUES (?, ?)',
      args: [Date.now().toString(), 'Test todo'],
    });
    
    // Example: Fetch all todos
    const result = await turso.execute('SELECT * FROM todos');
    
    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { 
        error: handled.error, 
        code: handled.code,
        details: error.message,
      },
      { status: handled.code }
    );
  }
}

