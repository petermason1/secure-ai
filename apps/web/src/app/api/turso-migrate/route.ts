import { NextRequest, NextResponse } from 'next/server';
import { turso, handleTursoError } from '@/lib/turso';
import fs from 'fs';
import path from 'path';

// Migration files in order
const migrations = [
  '001_core_tables.sql',
  '002_department_tables.sql',
  '003_merge_tier1_documents.sql',
  '004_merge_tier2_sales.sql',
  '005_merge_social_media.sql',
];

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    const results: any[] = [];

    for (const migrationFile of migrations) {
      const filePath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(filePath)) {
        results.push({
          file: migrationFile,
          status: 'skipped',
          reason: 'File not found',
        });
        continue;
      }

      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Remove comment lines
        const lines = sql.split('\n');
        const cleanedLines = lines.filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        });
        
        // Rejoin and split by semicolons, but track BEGIN/END blocks
        const fullSql = cleanedLines.join('\n');
        const statements: string[] = [];
        let current = '';
        let inBegin = false;
        let beginCount = 0;
        
        for (let i = 0; i < fullSql.length; i++) {
          const char = fullSql[i];
          const upper = fullSql.substring(i).toUpperCase();
          
          // Detect BEGIN
          if (upper.startsWith('BEGIN') && (i === 0 || /\s/.test(fullSql[i - 1]))) {
            inBegin = true;
            beginCount++;
            current += 'BEGIN';
            i += 4; // Skip "BEGIN"
            continue;
          }
          
          // Detect END
          if (upper.startsWith('END') && (i === 0 || /\s/.test(fullSql[i - 1]))) {
            beginCount--;
            if (beginCount === 0) {
              inBegin = false;
            }
            current += 'END';
            i += 2; // Skip "END"
            
            // Look for semicolon after END
            let j = i + 1;
            while (j < fullSql.length && /\s/.test(fullSql[j])) {
              j++;
            }
            if (j < fullSql.length && fullSql[j] === ';') {
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
        
        // Filter and clean statements
        const validStatements = statements
          .map(s => s.trim())
          .filter(s => s.length > 0 && s !== ';');

        // Execute each statement ONE AT A TIME (Turso requirement)
        let statementErrors: string[] = [];
        for (const statement of validStatements) {
          if (!statement || statement.trim().length === 0) continue;
          
          try {
            // Execute single statement - Turso only accepts one at a time
            const sqlToExecute = statement.trim();
            await turso.execute(sqlToExecute);
          } catch (error: any) {
            // Check if it's a "table already exists" error (safe to ignore)
            if (error.message?.includes('already exists') || 
                error.message?.includes('duplicate') ||
                error.message?.includes('UNIQUE constraint') ||
                error.message?.includes('already exist')) {
              // Safe to ignore - table already exists
              continue;
            } else {
              // Log the error but continue with next statement
              console.error(`Error in statement: ${statement.substring(0, 100)}...`, error.message);
              statementErrors.push(`${statement.substring(0, 50)}...: ${error.message}`);
            }
          }
        }

        if (statementErrors.length > 0) {
          results.push({
            file: migrationFile,
            status: 'partial',
            errors: statementErrors,
          });
        } else {
          results.push({
            file: migrationFile,
            status: 'success',
          });
        }
      } catch (error: any) {
        results.push({
          file: migrationFile,
          status: 'error',
          error: error.message,
        });
        // Continue with next migration even if one fails
      }
    }

    // Verify tables were created
    let tables: string[] = [];
    try {
      const result = await turso.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name;
      `);
      tables = result.rows.map((row: any) => row.name);
    } catch (error) {
      // Ignore verification errors
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: errorCount === 0,
      migrations: results,
      tables_created: tables.length,
      tables: tables,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        skipped: results.filter(r => r.status === 'skipped').length,
      },
    });
  } catch (err: any) {
    const handled = handleTursoError(err);
    return NextResponse.json(
      {
        success: false,
        error: handled.error,
        code: handled.code,
        details: err.message,
      },
      { status: handled.code }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Just verify connection and show current tables
    const result = await turso.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    const tables = result.rows.map((row: any) => row.name);

    return NextResponse.json({
      success: true,
      message: 'Turso connected',
      tables_count: tables.length,
      tables: tables,
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

