import { NextRequest, NextResponse } from 'next/server';
import { turso, handleTursoError } from '@/lib/turso';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sql } = body;

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }

    // Basic safety check - prevent DROP/TRUNCATE without explicit flag
    const dangerousKeywords = ['DROP', 'TRUNCATE', 'DELETE FROM'];
    const hasDangerousKeyword = dangerousKeywords.some(keyword => 
      sql.toUpperCase().includes(keyword)
    );

    if (hasDangerousKeyword && !body.allowDangerous) {
      return NextResponse.json(
        { 
          error: 'Dangerous operation detected. Set allowDangerous: true to proceed.',
          dangerous: true
        },
        { status: 400 }
      );
    }

    // Split SQL into individual statements, handling BEGIN/END blocks
    const statements: string[] = [];
    let current = '';
    let inBegin = false;
    let beginCount = 0;
    
    // Remove comment lines first
    const lines = sql.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    const cleanedSql = lines.join('\n');
    
    // Parse statements, handling BEGIN/END blocks
    for (let i = 0; i < cleanedSql.length; i++) {
      const char = cleanedSql[i];
      const upper = cleanedSql.substring(i).toUpperCase();
      
      // Detect BEGIN
      if (upper.startsWith('BEGIN') && (i === 0 || /\s/.test(cleanedSql[i - 1]))) {
        inBegin = true;
        beginCount++;
        current += 'BEGIN';
        i += 4; // Skip "BEGIN"
        continue;
      }
      
      // Detect END
      if (upper.startsWith('END') && (i === 0 || /\s/.test(cleanedSql[i - 1]))) {
        beginCount--;
        if (beginCount === 0) {
          inBegin = false;
        }
        current += 'END';
        i += 2; // Skip "END"
        
        // Look for semicolon after END
        let j = i + 1;
        while (j < cleanedSql.length && /\s/.test(cleanedSql[j])) {
          j++;
        }
        if (j < cleanedSql.length && cleanedSql[j] === ';') {
          current += ';';
          i = j;
          statements.push(current.trim());
          current = '';
          continue;
        }
        continue;
      }
      
      current += char;
      
      // If semicolon and not in BEGIN block, end statement
      if (char === ';' && !inBegin) {
        statements.push(current.trim());
        current = '';
      }
    }
    
    // Add any remaining
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    // Filter empty statements
    const validStatements = statements
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== ';');

    // Execute statements one at a time
    const results: any[] = [];
    let lastResult: any = null;
    let totalRowsAffected = 0;
    let successCount = 0;

    for (const statement of validStatements) {
      if (statement.length === 0) continue;
      
      try {
        // Execute one statement at a time
        const result = await turso.execute(statement);
        lastResult = result;
        totalRowsAffected += result.rowsAffected || 0;
        successCount++;
        results.push({
          statement: statement.substring(0, 60) + (statement.length > 60 ? '...' : ''),
          success: true,
          rows_affected: result.rowsAffected || 0,
        });
      } catch (error: any) {
        // Check if it's a "table already exists" or "index already exists" (safe to ignore)
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.message?.includes('UNIQUE constraint') ||
            error.message?.includes('already exist')) {
          // Safe to ignore
          successCount++;
          results.push({
            statement: statement.substring(0, 60) + (statement.length > 60 ? '...' : ''),
            success: true,
            skipped: true,
            message: 'Already exists',
          });
        } else {
          results.push({
            statement: statement.substring(0, 60) + (statement.length > 60 ? '...' : ''),
            success: false,
            error: error.message,
          });
        }
      }
    }

    // Return the last result's data, but include summary
    return NextResponse.json({
      success: results.every(r => r.success),
      rows_affected: totalRowsAffected,
      rows: lastResult?.rows || [],
      columns: lastResult?.columns || [],
      row_count: lastResult?.rows?.length || 0,
      statements_executed: results.length,
      results: results,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      {
        success: false,
        error: handled.error,
        code: handled.code,
        details: error.message,
        sql_error: error.message,
      },
      { status: handled.code }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Show table schema
    const result = await turso.execute(`
      SELECT 
        name,
        sql
      FROM sqlite_master 
      WHERE type='table'
      ORDER BY name;
    `);

    return NextResponse.json({
      success: true,
      tables: result.rows || [],
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      {
        success: false,
        error: handled.error,
        code: handled.code,
        details: error.message,
      },
      { status: handled.code }
    );
  }
}

