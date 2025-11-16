import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();

    const body = await request.json();
    const { from_agent_id, to_agent_id, message_type, subject, content, priority } = body;

    if (!from_agent_id || !message_type || !content) {
      return NextResponse.json(
        { error: 'from_agent_id, message_type, and content are required' },
        { status: 400 }
      );
    }

    // Check for conflicts (simplified - would use AI in production)
    const conflictCheck = await checkConflicts(turso, from_agent_id, to_agent_id, content);

    // Prepare content as JSON string
    const contentJson = typeof content === 'string' ? content : JSON.stringify(content);
    const messageId = randomUUID();
    const now = new Date().toISOString();

    // Create message
    await turso.execute({
      sql: `INSERT INTO agent_messages (
        id, from_agent_id, to_agent_id, message_type, content, priority, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        messageId,
        from_agent_id,
        to_agent_id || null,
        message_type,
        contentJson,
        priority || 'medium',
        'delivered', // Mark as delivered immediately
        now,
      ],
    });

    // If conflicts detected, create conflict record
    if (conflictCheck.conflicts_found && conflictCheck.conflicts.length > 0) {
      const conflictId = randomUUID();
      const conflict = conflictCheck.conflicts[0];
      
      await turso.execute({
        sql: `INSERT INTO conflicts (
          id, conflict_type, agent_ids, description, severity, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          conflictId,
          conflict.type || 'action',
          JSON.stringify([from_agent_id, to_agent_id].filter(Boolean)),
          conflict.description || 'Contradictory actions detected',
          conflict.severity || 'medium',
          'detected',
          now,
        ],
      });
    }

    return NextResponse.json({
      message_id: messageId,
      status: 'delivered',
      conflict_detected: conflictCheck.conflicts_found,
      conflict_check: {
        checked: true,
        conflicts_found: conflictCheck.conflicts_found ? 1 : 0,
        conflicts: conflictCheck.conflicts_found ? conflictCheck.conflicts : [],
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

async function checkConflicts(
  turso: any,
  from_agent_id: string,
  to_agent_id: string | null,
  content: any
) {
  // Simplified conflict detection
  // In production, this would use AI to analyze content and detect conflicts

  try {
    // Check for recent messages between these agents
    let sql = `SELECT * FROM agent_messages WHERE status = 'pending'`;
    const args: any[] = [];
    
    if (to_agent_id) {
      sql += ` AND ((from_agent_id = ? AND to_agent_id = ?) OR (from_agent_id = ? AND to_agent_id = ?))`;
      args.push(from_agent_id, to_agent_id, to_agent_id, from_agent_id);
    } else {
      sql += ` AND from_agent_id = ?`;
      args.push(from_agent_id);
    }
    
    sql += ` ORDER BY created_at DESC LIMIT 10`;

    const result = await turso.execute({ sql, args });
    const recentMessages = result.rows || [];

    const conflicts: any[] = [];

    if (recentMessages.length > 0) {
      // Check for contradictory actions
      const newContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      for (const msg of recentMessages) {
        const msgContent = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        
        // Simple contradiction check (would be more sophisticated in production)
        if (msgContent.action && newContent.action && msgContent.action !== newContent.action) {
          conflicts.push({
            type: 'action',
            with_agent: to_agent_id || 'multiple',
            description: 'Contradictory actions detected',
            severity: 'medium',
          });
          break;
        }
      }
    }

    return {
      conflicts_found: conflicts.length > 0,
      conflicts,
    };
  } catch (error) {
    // If conflict check fails, continue without conflicts
    return {
      conflicts_found: false,
      conflicts: [],
    };
  }
}
