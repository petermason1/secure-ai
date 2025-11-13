import Link from 'next/link';

export default function BigServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Big Services
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            AI-Augmented Service Delivery Platform
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/sales-agent"
            className="group rounded-xl border border-white/10 bg-slate-800/60 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800/80"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Sales Automation Agent</h2>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Tier 2: AI-powered lead scoring, rule-based routing, and automated CRM/Email actions with complete audit logging.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-400 group-hover:text-emerald-300">
              <span>View System</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/sales-agent-ideas"
            className="group rounded-xl border border-white/10 bg-slate-800/60 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800/80"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Generate Ideas</h2>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Use the Idea Generator to brainstorm improvements, features, and enhancements for the Sales Automation system.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-400 group-hover:text-blue-300">
              <span>Generate Ideas</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
