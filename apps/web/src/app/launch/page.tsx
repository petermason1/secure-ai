"use client";

export default function LaunchPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Under Construction</p>
        <h1 className="text-4xl font-bold">Secure AI Control Studio</h1>
        <p className="text-lg text-slate-300">
          We’re rebuilding the founder dashboard behind closed doors. Trades, launches, and dream modes will open soon.
        </p>
        <div className="mt-6 inline-flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-full border border-white/30 px-6 py-3 text-lg font-semibold text-white transition hover:border-white"
            onClick={() => alert('Thanks for your interest. We’ll notify you privately.')}
          >
            Notify Me When Live
          </button>
          <button
            className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 hover:bg-slate-200"
            onClick={() => alert('Founder contact: trade@secureai-control.com')}
          >
            Contact Founder
          </button>
        </div>
      </div>
    </main>
  );
}

