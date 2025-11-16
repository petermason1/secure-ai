import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { rounds = 5 } = body;

    const results = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (let i = 0; i < rounds; i++) {
      // Red team attacks
      const attackRes = await fetch(`${baseUrl}/api/security/red-team/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attack_type: 'automated',
          target: 'platform',
        }),
      });

      const attackData = await attackRes.json();
      
      if (attackData.success) {
        // Wait a bit for defense
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get defense result
        const defenseRes = await fetch(`${baseUrl}/api/security/blue-team/defend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attack_id: attackData.attack_id,
            attack_details: attackData.attack_details,
          }),
        });

        const defenseData = await defenseRes.json();
        
        results.push({
          round: i + 1,
          attack: attackData.attack_details.method,
          blocked: defenseData.blocked,
          defense: defenseData.defense_details.defense_mechanism,
        });
      }
    }

    // Get statistics
    const blocked = results.filter(r => r.blocked).length;
    const total = results.length;

    return NextResponse.json({
      success: true,
      rounds: total,
      blocked,
      success_rate: total > 0 ? ((blocked / total) * 100).toFixed(1) + '%' : '0%',
      results,
      message: `Security battle completed: ${blocked}/${total} attacks blocked`,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error', details: error.message },
      { status: handled.code || 500 }
    );
  }
}
