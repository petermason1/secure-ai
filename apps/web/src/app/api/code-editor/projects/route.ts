import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await turso.execute({
      sql: `SELECT p.*, 
                   COUNT(DISTINCT f.id) as file_count
            FROM code_projects p
            LEFT JOIN code_files f ON p.id = f.project_id
            WHERE p.status = ?
            GROUP BY p.id
            ORDER BY p.updated_at DESC
            LIMIT ?`,
      args: [status, limit],
    });

    const projects = result.rows.map((row: any) => ({
      id: row.id,
      project_name: row.project_name,
      description: row.description,
      language: row.language,
      framework: row.framework,
      status: row.status,
      file_count: row.file_count || 0,
      metadata: JSON.parse(String(row.metadata || '{}')),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to list projects' },
      { status: handled.code || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { project_name, description, language, framework } = body;

    if (!project_name) {
      return NextResponse.json(
        { error: 'project_name is required' },
        { status: 400 }
      );
    }

    const projectId = randomUUID();

    // Get Code Editor agent
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Code%' AND department_id IN (SELECT id FROM departments WHERE name LIKE '%Code Editor%') LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    await turso.execute({
      sql: `INSERT INTO code_projects (id, project_name, description, language, framework, status, created_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'active', ?, datetime('now'), datetime('now'))`,
      args: [projectId, project_name, description || null, language || null, framework || null, agentId],
    });

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        project_name,
        description,
        language,
        framework,
        status: 'active',
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to create project' },
      { status: handled.code || 500 }
    );
  }
}

