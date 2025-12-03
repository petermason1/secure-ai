'use client';

import prompts from '../../../content/prompts.json';

export default function PromptsPage() {
  const list = prompts as Array<{ id: string; title: string; content: string }>;
  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Prompt Library</h1>
        <p className="text-slate-300 mb-6">Copy useful prompts for development and operations.</p>
        <div className="space-y-4">
          {list.map((p) => (
            <article key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <button
                  className="rounded-full border border-white/25 px-3 py-1 text-sm hover:border-white"
                  onClick={() => navigator.clipboard.writeText(p.content)}
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">{p.id}</p>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{p.content}</pre>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}


