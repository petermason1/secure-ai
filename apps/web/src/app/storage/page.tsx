'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StoragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch('/api/storage/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          search_type: 'both',
        }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              SF
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Storage & Filing
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                File Management
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            AI-Powered Search
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Search files by content, not just filename
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files... (e.g., 'contract with ABC Corp from last year')"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-400 focus:border-emerald-300/60 focus:outline-none focus:ring focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-white">
              Results ({searchResults.length})
            </h3>
            {searchResults.map((result) => (
              <div
                key={result.file_id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{result.file_name}</h4>
                    <p className="mt-1 text-sm text-slate-300">{result.snippet}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-emerald-300">
                      {(result.relevance_score * 100).toFixed(0)}% match
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {result.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !searching && searchQuery && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-400">
            No results found. Try a different search query.
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-white">Auto-Organization</h3>
            <p className="mt-2 text-sm text-slate-300">
              Files are automatically categorized and tagged
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-white">Version Control</h3>
            <p className="mt-2 text-sm text-slate-300">
              Track all file versions and changes
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-white">Duplicate Detection</h3>
            <p className="mt-2 text-sm text-slate-300">
              Automatically detects and manages duplicates
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

