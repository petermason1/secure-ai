'use client';
export default function Home() {
  return (
    <main className="px-6 py-12">
      <header className="mx-auto max-w-5xl mb-10">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <span className="text-sm uppercase tracking-[0.35em] text-slate-300">Secure AI Control</span>
          <div className="flex gap-3">
            <a href="/contact.html" className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white">
              Contact
            </a>
            <a href="/api-demo" className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white">
              API Demo
            </a>
            <a href="/api/blogs" className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white">
              Blogs API
            </a>
            <a href="/ideas" className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white">
              Ideas
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-900/30 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Launch Offer</p>
        <h1 className="mt-2 text-4xl font-bold">Governance‑first launches. Two‑week proof, then scale.</h1>
        <p className="mt-3 text-slate-300">
          Start with a fixed‑fee Audit Pack Sprint. We deliver a control matrix, drill log, and executive memo you can
          show to boards and partners.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-md hover:bg-slate-100" href="/contact.html">
            Book 15‑min Scope Call
          </a>
          <a className="rounded-full border border-white/25 px-6 py-3 font-semibold hover:border-white" href="/api/blogs">
            View Blogs API
          </a>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-blue-900/20 to-slate-900/30 p-8">
        <h2 className="text-2xl font-bold mb-3">Business APIs Ready</h2>
        <p className="text-slate-300 mb-6">
          Test and integrate our APIs for credits, AI automation, lead management, and more.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-1">Credits System</h3>
            <p className="text-sm text-slate-400">Monetization & usage tracking</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-1">Junior Dev Team</h3>
            <p className="text-sm text-slate-400">AI-powered automation</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-1">CEO Call System</h3>
            <p className="text-sm text-slate-400">Executive tracking</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-1">Lead Management</h3>
            <p className="text-sm text-slate-400">Full CRM functionality</p>
          </div>
        </div>
        <a
          href="/api-demo"
          className="inline-block rounded-full bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Try API Demo →
        </a>
      </section>

      <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-2">Snippet Loader (HTML demos)</h2>
        <p className="text-slate-300 mb-3 text-sm">Enter a code like <code>001-OPS</code> to inject a static HTML demo below.</p>
        <div className="flex gap-2 flex-wrap">
          <input id="snippet-code" className="rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm" placeholder="001-OPS" />
          <button
            className="rounded-xl border border-white/25 px-4 py-2 text-sm hover:border-white"
            onClick={(e) => {
              e.preventDefault();
              // @ts-ignore
              const code = (document.getElementById('snippet-code') as HTMLInputElement).value.trim();
              // @ts-ignore
              window.SACS?.loadSnippet('snippet-target', code);
            }}
          >
            Load
          </button>
        </div>
        <div id="snippet-target" className="mt-4"></div>
        <script src="/js/snippet-loader.js" defer></script>
      </section>

      <footer className="mx-auto mt-10 max-w-5xl text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Secure AI Control • Minimal live page
      </footer>
    </main>
  );
}


