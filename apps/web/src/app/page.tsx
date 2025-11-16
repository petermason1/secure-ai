export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="uppercase tracking-[0.35em] text-slate-400 text-sm">
          Secure AI Control
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Governance-first launches. Two-week proof, then scale.
        </h1>
        <p className="text-slate-300">
          We help founders ship sensitive AI/crypto/BI workflows with human-in-loop controls
          and audit-ready evidence. Start with a 2‑week Audit Pack Sprint.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href="/"
            className="rounded-full bg-white text-slate-900 px-6 py-3 font-semibold shadow-lg shadow-cyan-500/30 hover:bg-slate-200"
          >
            Home
          </a>
        </div>
      </div>
    </main>
  );
}


