import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/token-manager';

export async function GET(request: NextRequest) {
  try {
    const stats = getUsageStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
