'use client';

import { useState } from 'react';

type DomainResult = {
  domain: string;
  available: boolean;
  registrar_url: string;
};

type SearchResult = {
  query: string;
  total_checked: number;
  available_count: number;
  results: DomainResult[];
};

export default function DomainFinderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/domain-finder/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Domain search failed:', error);
      alert(`Failed to check domains: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      search();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Domain Finder</h1>
          <p className="mt-2 text-slate-300">
            Check domain availability and get smart suggestions for your next project.
          </p>
        </header>

        {/* Search Box */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔍</div>
            <input
              type="text"
              className="flex-1 rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
              placeholder="Enter your idea (e.g., superapp, myproject, coolstartup)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-950 border-t-transparent" />
                  Checking...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-4">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Query</p>
                <p className="mt-2 text-2xl font-bold text-white">{result.query}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Checked</p>
                <p className="mt-2 text-2xl font-bold text-white">{result.total_checked}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Available</p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">{result.available_count}</p>
              </div>
            </div>

            {/* Domain List */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
              <div className="space-y-2">
                {result.results.map((domain, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-4 transition ${
                      domain.available
                        ? 'border-emerald-400/30 bg-emerald-500/10'
                        : 'border-white/10 bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {domain.available ? '✓' : '✕'}
                      </span>
                      <div>
                        <p className={`font-semibold ${domain.available ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {domain.domain}
                        </p>
                        <p className="text-xs text-slate-500">
                          {domain.available ? 'Available' : 'Taken'}
                        </p>
                      </div>
                    </div>
                    {domain.available && (
                      <a
                        href={domain.registrar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/10"
                      >
                        Register →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <section className="mt-12 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">How It Works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Smart Suggestions</h3>
              <p className="mt-1 text-xs text-slate-300">
                We generate variations with popular prefixes (get, try, use) and suffixes (app, hq, labs)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Multiple TLDs</h3>
              <p className="mt-1 text-xs text-slate-300">
                Check .com, .io, .ai, .co, .app, .dev, .tech, and more
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Real-Time Check</h3>
              <p className="mt-1 text-xs text-slate-300">
                DNS-based availability check (not 100% accurate, verify before purchasing)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Direct Registration</h3>
              <p className="mt-1 text-xs text-slate-300">
                Click to register available domains instantly via Namecheap
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-amber-400/30 bg-amber-500/10 p-6">
          <h2 className="text-sm font-semibold text-amber-200">⚠️ Important Note</h2>
          <p className="mt-2 text-xs text-amber-100">
            This tool uses DNS lookups to estimate availability. Always verify domain availability
            on the registrar's website before making a purchase decision. Some domains may be
            registered but not yet configured with DNS records.
          </p>
        </section>
      </div>
    </div>
  );
}
