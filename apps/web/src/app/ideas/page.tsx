import ideas from '../../../content/ideas.json';

export default function IdeasPage() {
  const list = ideas as Array<{ code: string; title: string; summary: string; price: string }>;
  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Idea Catalogue</h1>
        <p className="text-slate-300 mb-6">
          A shortlist of concepts you can request a demo for. Prices are indicative for a 2‑week Audit Pack or pilot.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((i) => (
            <article key={i.code} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{i.code}</p>
              <h2 className="text-lg font-semibold">{i.title}</h2>
              <p className="text-slate-300 text-sm">{i.summary}</p>
              <p className="mt-2 text-sm text-slate-400">Estimated: {i.price}</p>
              <div className="mt-3 flex gap-2">
                <a href="/contact.html" className="rounded-full border border-white/25 px-3 py-1 text-sm hover:border-white">
                  Request Demo
                </a>
                <a href="/" className="rounded-full border border-white/25 px-3 py-1 text-sm hover:border-white">
                  Back
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}


