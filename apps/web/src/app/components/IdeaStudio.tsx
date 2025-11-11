'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  GenerateIdeaOptions,
  Idea,
  PromptCategory,
  PromptTaxonomy,
} from '@idea-randomizer/core';

type GenerateResponse = {
  ideas: Idea[];
  taxonomy?: PromptTaxonomy;
  meta: {
    generatedAt: string;
    count: number;
    filtersApplied: Partial<GenerateIdeaOptions>;
  };
};

type IdeaEntry = {
  id: string;
  idea: Idea;
  generatedAt: string;
};

const HISTORY_STORAGE_KEY = 'idea-randomizer:history';
const SAVED_STORAGE_KEY = 'idea-randomizer:saved';

const createEntry = (idea: Idea): IdeaEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  idea,
  generatedAt: new Date().toISOString(),
});

const loadStoredEntries = (key: string): IdeaEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return [];
    }
    const parsed = JSON.parse(value) as IdeaEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const persistEntries = (key: string, entries: IdeaEntry[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(entries));
};

const formatRelativeTime = (isoDate: string) => {
  try {
    const now = new Date();
    const target = new Date(isoDate);
    const diff = now.getTime() - target.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } catch {
    return '';
  }
};

const sortCategories = (items: PromptCategory[]) =>
  [...items].sort((a, b) => a.title.localeCompare(b.title));

const ideaSummary = (idea: Idea) =>
  `${idea.headline}\n\n${idea.elevatorPitch}\n\nTalking points:\n- ${idea.talkingPoints.join(
    '\n- ',
  )}\n\nTags: ${idea.tags.join(', ')}`;

const optionLabel = (category: PromptCategory) =>
  `${category.title}${category.tags?.length ? ` · ${category.tags.join(', ')}` : ''}`;

export default function IdeaStudio() {
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [taxonomy, setTaxonomy] = useState<PromptTaxonomy | null>(null);
  const [history, setHistory] = useState<IdeaEntry[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<IdeaEntry[]>([]);
  const [filters, setFilters] = useState<GenerateIdeaOptions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadStoredEntries(HISTORY_STORAGE_KEY));
    setSavedIdeas(loadStoredEntries(SAVED_STORAGE_KEY));
  }, []);

  const updateHistory = useCallback((resolver: (previous: IdeaEntry[]) => IdeaEntry[]) => {
    setHistory((previous) => {
      const next = resolver(previous);
      const trimmed = next.slice(0, 12);
      persistEntries(HISTORY_STORAGE_KEY, trimmed);
      return trimmed;
    });
  }, []);

  const updateSaved = useCallback((resolver: (previous: IdeaEntry[]) => IdeaEntry[]) => {
    setSavedIdeas((previous) => {
      const next = resolver(previous);
      persistEntries(SAVED_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const fetchIdea = useCallback(
    async (options?: GenerateIdeaOptions) => {
      setLoading(true);
      setError(null);
      try {
        const payload = options && Object.keys(options).length > 0 ? { ...options } : undefined;
        const response = await fetch('/api/generate', {
          method: payload ? 'POST' : 'GET',
          headers: payload ? { 'Content-Type': 'application/json' } : undefined,
          body: payload ? JSON.stringify({ ...payload, count: 1 }) : undefined,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to generate idea.');
        }

        const data = (await response.json()) as GenerateResponse;

        const [idea] = data.ideas;
        if (!idea) {
          throw new Error('Generator returned an empty result.');
        }

        setCurrentIdea(idea);
        const entry = createEntry(idea);
        updateHistory((previous) => {
          const deduped = previous.filter((item) => item.idea.headline !== idea.headline);
          return [entry, ...deduped];
        });

        if (data.taxonomy) {
          setTaxonomy(data.taxonomy);
        }

        setToast('✨ New idea generated');
        setTimeout(() => setToast(null), 2400);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [updateHistory],
  );

  useEffect(() => {
    void fetchIdea();
  }, [fetchIdea]);

  const handleFilterChange = useCallback((key: keyof GenerateIdeaOptions, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setToast('Filters cleared');
    setTimeout(() => setToast(null), 1800);
  }, []);

  const handleGenerate = useCallback(() => {
    void fetchIdea(filters);
  }, [fetchIdea, filters]);

  const handleSave = useCallback(() => {
    if (!currentIdea) {
      return;
    }

    const alreadySaved = savedIdeas.some(
      (entry) => entry.idea.headline === currentIdea.headline,
    );
    if (alreadySaved) {
      setToast('Already saved');
      setTimeout(() => setToast(null), 1600);
      return;
    }

    updateSaved((previous) => {
      const entry = createEntry(currentIdea);
      const deduped = previous.filter((item) => item.idea.headline !== currentIdea.headline);
      return [entry, ...deduped].slice(0, 20);
    });
    setToast('💾 Idea saved');
    setTimeout(() => setToast(null), 2000);
  }, [currentIdea, savedIdeas, updateSaved]);

  const handleCopy = useCallback(() => {
    if (!currentIdea) {
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setToast('Clipboard not available');
      setTimeout(() => setToast(null), 1800);
      return;
    }
    void navigator.clipboard.writeText(ideaSummary(currentIdea));
    setToast('📋 Copied to clipboard');
    setTimeout(() => setToast(null), 2000);
  }, [currentIdea]);

  const themeOptions = useMemo(
    () => (taxonomy ? sortCategories(taxonomy.themes) : []),
    [taxonomy],
  );
  const audienceOptions = useMemo(
    () => (taxonomy ? sortCategories(taxonomy.audiences) : []),
    [taxonomy],
  );
  const problemOptions = useMemo(
    () => (taxonomy ? sortCategories(taxonomy.problems) : []),
    [taxonomy],
  );
  const twistOptions = useMemo(
    () => (taxonomy ? sortCategories(taxonomy.twists) : []),
    [taxonomy],
  );

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur">
        <header className="flex flex-col gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Idea Studio</h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              {loading ? 'Generating…' : 'Ready'}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            Dial in a theme, audience, problem, and twist—then let the randomizer draft your next
            MVP concept.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Theme
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
              value={filters.themeId ?? ''}
              onChange={(event) => handleFilterChange('themeId', event.target.value)}
              disabled={!themeOptions.length}
            >
              <option value="">Any theme</option>
              {themeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Audience
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
              value={filters.audienceId ?? ''}
              onChange={(event) => handleFilterChange('audienceId', event.target.value)}
              disabled={!audienceOptions.length}
            >
              <option value="">Any audience</option>
              {audienceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Problem
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
              value={filters.problemId ?? ''}
              onChange={(event) => handleFilterChange('problemId', event.target.value)}
              disabled={!problemOptions.length}
            >
              <option value="">Any problem</option>
              {problemOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Twist
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
              value={filters.twistId ?? ''}
              onChange={(event) => handleFilterChange('twistId', event.target.value)}
              disabled={!twistOptions.length}
            >
              <option value="">Any twist</option>
              {twistOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300 active:translate-y-px"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate idea'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/60 hover:text-white"
            onClick={handleClearFilters}
            disabled={loading || Object.keys(filters).length === 0}
          >
            Reset filters
          </button>
          <span className="text-xs text-slate-400">
            {taxonomy
              ? `${taxonomy.themes.length} themes · ${taxonomy.audiences.length} audiences · ${taxonomy.problems.length} problems · ${taxonomy.twists.length} twists`
              : 'Loading taxonomy…'}
          </span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-slate-800/60 p-5 shadow-inner shadow-slate-900/30">
            {currentIdea ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold text-white">{currentIdea.headline}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1">
                      {currentIdea.theme.title}
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1">
                      {currentIdea.audience.title}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-200">{currentIdea.elevatorPitch}</p>
                <div>
                  <h4 className="text-sm font-semibold text-white/90">Talking points</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {currentIdea.talkingPoints.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-left leading-relaxed"
                      >
                        <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-400/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:translate-y-px"
                    onClick={handleSave}
                  >
                    Save idea
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-emerald-200"
                    onClick={handleCopy}
                  >
                    Copy pitch
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-300">
                {loading ? 'Summoning your first idea…' : 'Generate an idea to see it here.'}
              </div>
            )}
          </article>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Recent ideas
            </h3>
            <span className="text-xs text-slate-400">{history.length} saved</span>
          </header>
          <ul className="space-y-3">
            {history.length === 0 ? (
              <li className="text-sm text-slate-400">
                Generate ideas to build your creative trail.
              </li>
            ) : (
              history.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-slate-800/60 p-3 transition hover:border-emerald-400/40"
                >
                  <p className="text-sm font-semibold text-white">{entry.idea.headline}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(entry.generatedAt)}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Saved favorites
            </h3>
            <span className="text-xs text-slate-400">{savedIdeas.length}</span>
          </header>
          <ul className="space-y-3">
            {savedIdeas.length === 0 ? (
              <li className="text-sm text-slate-400">Save ideas you love to revisit later.</li>
            ) : (
              savedIdeas.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-slate-800/60 p-3 transition hover:border-emerald-400/40"
                >
                  <p className="text-sm font-semibold text-white">{entry.idea.headline}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {entry.idea.audience.title} · {entry.idea.twist.title}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </aside>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 inset-x-0 z-50 flex justify-center">
          <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/40">
            {toast}
          </div>
        </div>
      )}
    </section>
  );
}

