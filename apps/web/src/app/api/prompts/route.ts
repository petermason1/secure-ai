import { NextResponse } from 'next/server';
import prompts from '../../../../content/prompts.json';

export async function GET() {
  // return light list (id, title)
  const list = (prompts as Array<{ id: string; title: string }>).map((p) => ({
    id: p.id,
    title: p.title,
  }));
  return NextResponse.json({ prompts: list });
}


