import { NextResponse } from 'next/server';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'apps/web/content/blog');

function parse(fileName: string, content: string) {
  const m = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  const date = m ? m[1] : '';
  const slug = m ? m[2] : fileName.replace(/\.md$/, '');
  const h1 = content.split('\n').find((l) => /^#\s+/.test(l)) || '';
  const title = h1.replace(/^#\s+/, '').trim() || slug;
  return { slug, date, title, content };
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const files = await readdir(BLOG_DIR);
    const file = files.find((f) => f.endsWith(`${slug}.md`) || f.includes(`-${slug}.md`));
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const content = await readFile(path.join(BLOG_DIR, file), 'utf8');
    return NextResponse.json(parse(file, content));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Cannot read post' }, { status: 500 });
  }
}


