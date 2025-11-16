import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const file_path = searchParams.get('file_path');

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    let sql = `SELECT * FROM code_files WHERE project_id = ?`;
    const args: any[] = [project_id];

    if (file_path) {
      sql += ` AND file_path = ?`;
      args.push(file_path);
    }

    sql += ` ORDER BY file_path`;

    const result = await turso.execute({ sql, args });

    const files = result.rows.map((row: any) => ({
      id: row.id,
      project_id: row.project_id,
      file_path: row.file_path,
      file_name: row.file_name,
      file_content: row.file_content,
      language: row.language,
      file_type: row.file_type,
      size_bytes: row.size_bytes,
      last_modified: row.last_modified,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list files' },
      { status: handled.code || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { project_id, file_path, file_name, file_content, language, file_type } = body;

    if (!project_id || !file_path || !file_name) {
      return NextResponse.json(
        { error: 'project_id, file_path, and file_name are required' },
        { status: 400 }
      );
    }

    const fileId = randomUUID();
    const content = file_content || '';
    const sizeBytes = new Blob([content]).size;

    await turso.execute({
      sql: `INSERT INTO code_files (id, project_id, file_path, file_name, file_content, language, file_type, size_bytes, last_modified, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
            ON CONFLICT(project_id, file_path) DO UPDATE SET
              file_content = excluded.file_content,
              size_bytes = excluded.size_bytes,
              last_modified = datetime('now'),
              updated_at = datetime('now')`,
      args: [
        fileId,
        project_id,
        file_path,
        file_name,
        content,
        language || null,
        file_type || 'code',
        sizeBytes,
      ],
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        project_id,
        file_path,
        file_name,
        size_bytes: sizeBytes,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to save file' },
      { status: handled.code || 500 }
    );
  }
}

