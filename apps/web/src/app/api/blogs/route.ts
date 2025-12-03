import { NextResponse } from 'next/server';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'apps/web/content/blog');

function parseMeta(fileName: string, content: string) {
  // filename: YYYY-MM-DD-slug.md
  const m = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  const date = m ? m[1] : '';
  const slug = m ? m[2] : fileName.replace(/\.md$/, '');
  // title: first markdown H1
  const h1 = content.split('\n').find((l) => /^#\s+/.test(l)) || '';
  const title = h1.replace(/^#\s+/, '').trim() || slug;
  return { slug, date, title };
}

export async function GET() {
  try {
    const files = await readdir(BLOG_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md'));
    const posts = await Promise.all(
      mdFiles.map(async (f) => {
        const full = path.join(BLOG_DIR, f);
        const content = await readFile(full, 'utf8');
        return parseMeta(f, content);
      }),
    );
    // newest first by date string
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Cannot read blog' }, { status: 500 });
  }
}


