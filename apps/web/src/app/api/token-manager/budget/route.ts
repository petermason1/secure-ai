import { NextRequest, NextResponse } from 'next/server';
import { setBudget, checkBudget } from '@/lib/token-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { department_id, daily_limit, monthly_limit } = body;

    if (!department_id || !daily_limit || !monthly_limit) {
      return NextResponse.json(
        { error: 'department_id, daily_limit, and monthly_limit are required' },
        { status: 400 }
      );
    }

    setBudget(department_id, daily_limit, monthly_limit);

    return NextResponse.json({
      success: true,
      message: `Budget set for ${department_id}: ${daily_limit}/day, ${monthly_limit}/month`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get('department_id');

    if (!department_id) {
      return NextResponse.json(
        { error: 'department_id is required' },
        { status: 400 }
      );
    }

    const check = checkBudget(department_id);
    return NextResponse.json({
      success: true,
      allowed: check.allowed,
      reason: check.reason,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
