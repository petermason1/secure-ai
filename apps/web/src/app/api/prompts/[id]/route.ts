import { NextResponse } from 'next/server';
import prompts from '../../../../../content/prompts.json';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = prompts as Array<{ id: string; title: string; content: string }>;
  const match = all.find((p) => p.id === id);
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(match);
}


