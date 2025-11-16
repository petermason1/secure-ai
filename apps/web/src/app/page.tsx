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
            <a href="/api/blogs" className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white">
              Blogs API
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

      <footer className="mx-auto mt-10 max-w-5xl text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Secure AI Control • Minimal live page
      </footer>
    </main>
  );
}


