import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploaded_by = formData.get('uploaded_by') as string || 'system';
    const department_id = formData.get('department_id') as string || null;
    const agent_id = formData.get('agent_id') as string || null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Auto-categorize file (simplified - would use AI in production)
    const category = categorizeFile(file.name, file.type);
    const tags = generateTags(file.name, category);

    // Check for duplicates by name
    const duplicateCheck = await turso.execute({
      sql: `SELECT id, name FROM files WHERE name = ? AND size > 0`,
      args: [file.name],
    });

    const duplicateFound = duplicateCheck.rows && duplicateCheck.rows.length > 0;

    // Store file metadata
    const fileId = randomUUID();
    const filePath = `/files/${fileId}/${file.name}`;
    const now = new Date().toISOString();

    // Determine file_type from mime_type
    let fileType: 'document' | 'image' | 'video' | 'audio' | 'other' = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) fileType = 'document';

    // Store metadata as JSON
    const metadata = {
      category,
      uploaded_by,
      original_name: file.name,
      suggested_folder: `/${category}/${new Date().getFullYear()}/`,
      auto_categorized: true,
    };

    await turso.execute({
      sql: `INSERT INTO files (
        id, name, path, department_id, agent_id, file_type, mime_type, size, metadata, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fileId,
        file.name,
        filePath,
        department_id,
        agent_id,
        fileType,
        file.type,
        file.size,
        JSON.stringify(metadata),
        JSON.stringify(tags),
        now,
        now,
      ],
    });

    return NextResponse.json({
      file_id: fileId,
      file_name: file.name,
      category,
      tags,
      location: filePath,
      duplicate_check: {
        duplicate_found: duplicateFound,
        existing_file_id: duplicateFound && duplicateCheck.rows?.[0] ? duplicateCheck.rows[0].id : null,
      },
      organization: {
        suggested_folder: `/${category}/${new Date().getFullYear()}/`,
        auto_categorized: true,
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

function categorizeFile(fileName: string, fileType: string): string {
  const name = fileName.toLowerCase();
  
  if (name.includes('contract')) return 'contract';
  if (name.includes('invoice')) return 'invoice';
  if (name.includes('proposal')) return 'proposal';
  if (name.includes('report')) return 'report';
  if (name.includes('meeting')) return 'meeting';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('pdf')) return 'document';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'spreadsheet';
  
  return 'document';
}

function generateTags(fileName: string, category: string): string[] {
  const tags: string[] = [category];
  const name = fileName.toLowerCase();
  
  // Extract year
  const yearMatch = name.match(/\d{4}/);
  if (yearMatch) tags.push(yearMatch[0]);
  
  // Extract company/client name (simplified)
  if (name.includes('abc')) tags.push('abc-corp');
  if (name.includes('xyz')) tags.push('xyz-inc');
  
  return tags;
}
