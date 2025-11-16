import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const migrationPath = path.join(process.cwd(), 'apps/web/db/migrations/019_security_advisory_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json(
        { error: 'Migration file not found' },
        { status: 404 }
      );
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results = [];
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await turso.execute(statement);
          results.push({ statement: statement.substring(0, 50) + '...', status: 'success' });
        } catch (error: any) {
          // Check if it's a "table already exists" error (safe to ignore)
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            results.push({ statement: statement.substring(0, 50) + '...', status: 'skipped (already exists)' });
          } else {
            throw error;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration 019 completed',
      results,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Migration failed', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

