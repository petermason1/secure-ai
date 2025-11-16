'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  GenerateIdeaOptions,
  Idea,
  PromptCategory,
  PromptPack,
  PromptTaxonomy,
} from '@idea-randomizer/core';

import ValidationBadge from './ValidationBadge';
import { useValidationData } from '../hooks/useValidationData';
import { useUsage, UsageTracker, UpgradePrompt } from './UsageTracker';

type GenerateResponse = {
  ideas: Idea[];
  taxonomy?: PromptTaxonomy;
  packs?: PromptPack[];
  meta: {
    generatedAt: string;
    count: number;
    filtersApplied: Partial<GenerateIdeaOptions>;
    seeds: string[];
  };
};

type IdeaEntry = {
  id: string;
  idea: Idea;
  generatedAt: string;
};

const HISTORY_STORAGE_KEY = 'idea-randomizer:history';
const SAVED_STORAGE_KEY = 'idea-randomizer:saved';

type PickerKey = 'themeId' | 'audienceId' | 'problemId' | 'twistId';

const createEntry = (idea: Idea): IdeaEntry => ({
  id: `${idea.seed}-${Date.now()}`,
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

const sanitizeSeedInput = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default function IdeaStudio() {
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [taxonomy, setTaxonomy] = useState<PromptTaxonomy | null>(null);
  const [packs, setPacks] = useState<PromptPack[]>([]);
  const [history, setHistory] = useState<IdeaEntry[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<IdeaEntry[]>([]);
  const [filters, setFilters] = useState<GenerateIdeaOptions>({});
  const [seedDraft, setSeedDraft] = useState<string>('');
  const [lastSeed, setLastSeed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const validationData = useValidationData();
  const { canGenerate, generate, remaining, isPro } = useUsage();

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
        const sanitizedOptions =
          options && Object.keys(options).length > 0
            ? (Object.fromEntries(
                Object.entries(options).filter(
                  ([, value]) => value !== undefined && value !== null && value !== '',
                ),
              ) as Partial<GenerateIdeaOptions>)
            : undefined;
        const payload =
          sanitizedOptions && Object.keys(sanitizedOptions).length > 0 ? sanitizedOptions : undefined;
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
          const deduped = previous.filter((item) => item.idea.seed !== idea.seed);
          return [entry, ...deduped];
        });

        if (data.taxonomy) {
          setTaxonomy(data.taxonomy);
        }
        if (data.packs) {
          setPacks(data.packs);
        }

        setToast('✨ New idea generated');
        setTimeout(() => setToast(null), 2400);
        return idea;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setError(message);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [updateHistory],
  );

  useEffect(() => {
    void fetchIdea().then((idea) => {
      if (idea) {
        setLastSeed(idea.seed);
      }
    });
  }, [fetchIdea]);

  const handleFilterChange = useCallback((key: PickerKey, value: string) => {
    setFilters((prev) => {
      const next: GenerateIdeaOptions = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const handlePackChange = useCallback((value: string) => {
    setFilters((prev) => {
      const next: GenerateIdeaOptions = { ...prev };
      if (!value || next.packId === value) {
        delete next.packId;
      } else {
        next.packId = value;
      }
      return next;
    });
  }, []);

  const handleSeedInputChange = useCallback((value: string) => {
    setSeedDraft(sanitizeSeedInput(value));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSeedDraft('');
    setToast('Filters cleared');
    setTimeout(() => setToast(null), 1800);
  }, []);

  const handleGenerate = useCallback(() => {
    // Check usage before generating
    if (!canGenerate) {
      setError('You\'ve reached your free limit. Upgrade to Pro for unlimited ideas!');
      return;
    }

    // Track usage (only if not Pro)
    if (!generate()) {
      setError('Unable to track usage. Please refresh and try again.');
      return;
    }

    const payload: GenerateIdeaOptions = { ...filters };
    const isSeeded = Boolean(seedDraft);
    if (isSeeded) {
      payload.seed = seedDraft;
    }

    const hasPayload = Object.values(payload).some(
      (value) => value !== undefined && value !== null && value !== '',
    );

    void fetchIdea(hasPayload ? payload : undefined).then((idea) => {
      if (idea) {
        setLastSeed(idea.seed);
        if (!isSeeded) {
          setSeedDraft('');
        }
      }
    });
  }, [fetchIdea, filters, seedDraft, canGenerate, generate]);

  const handleSave = useCallback(() => {
    if (!currentIdea) {
      return;
    }

    const alreadySaved = savedIdeas.some((entry) => entry.idea.seed === currentIdea.seed);
    if (alreadySaved) {
      setToast('Already saved');
      setTimeout(() => setToast(null), 1600);
      return;
    }

    updateSaved((previous) => {
      const entry = createEntry(currentIdea);
      const deduped = previous.filter((item) => item.idea.seed !== currentIdea.seed);
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

  const handleCopySeed = useCallback(() => {
    if (!currentIdea) {
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setToast('Clipboard not available');
      setTimeout(() => setToast(null), 1800);
      return;
    }
    void navigator.clipboard.writeText(currentIdea.seed);
    setToast('🔑 Idea code copied');
    setTimeout(() => setToast(null), 2000);
  }, [currentIdea]);

  const handleUseLastSeed = useCallback(() => {
    if (!lastSeed) {
      return;
    }
    setSeedDraft(lastSeed);
    setToast('Loaded last idea code');
    setTimeout(() => setToast(null), 1600);
  }, [lastSeed]);

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
  const packMap = useMemo(
    () => new Map<string, PromptPack>(packs.map((pack) => [pack.id, pack])),
    [packs],
  );
  const selectedPack = useMemo(
    () => (filters.packId ? packMap.get(filters.packId) ?? null : null),
    [filters.packId, packMap],
  );

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[1.2fr_1fr] md:gap-6 lg:gap-8 xl:max-w-7xl 2xl:max-w-7xl">
      <div className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-2 shadow-xl shadow-slate-950/20 backdrop-blur sm:gap-4 sm:p-4 md:p-6 lg:p-8 xl:p-10">
        <header className="flex min-w-0 flex-col gap-2 overflow-hidden border-b border-white/5 pb-2 sm:pb-3 md:pb-4 lg:pb-5">
          <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden sm:gap-3 lg:gap-4">
            <h2 className="min-w-0 truncate text-base font-semibold text-white sm:text-lg lg:text-xl xl:text-2xl">Idea Studio</h2>
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 sm:px-3 sm:py-1 sm:text-xs lg:text-sm">
              {loading ? 'Generating…' : 'Ready'}
            </span>
          </div>
          <p className="min-w-0 text-sm text-slate-300 wrap-break-word sm:text-base lg:text-lg">
            Dial in a theme, audience, problem, and twist—then let the randomizer draft your next
            MVP concept.
          </p>
        </header>

        {packs.length > 0 && (
          <section className="flex min-w-0 w-full max-w-full flex-col gap-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-800/40 p-1.5 sm:gap-3 sm:p-3 md:p-4 lg:p-5 xl:p-6">
            <div className="flex min-w-0 w-full max-w-full flex-col items-start gap-1.5 overflow-hidden sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200 sm:text-xs md:text-sm lg:text-base">
                  Prompt packs
                </h3>
                <p className="truncate text-[10px] text-slate-300 sm:text-[11px] md:text-xs lg:text-sm">
                  Quick-start mixes curated from the content library.
                </p>
              </div>
              {filters.packId && (
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 transition hover:border-emerald-300/80 hover:text-emerald-100 sm:px-3 sm:py-1 sm:text-xs lg:text-sm"
                  onClick={() => handlePackChange('')}
                >
                  Clear pack
                </button>
              )}
            </div>
            <div className="flex min-w-0 w-full max-w-full flex-col gap-1.5 overflow-hidden sm:flex-row sm:gap-3 sm:overflow-x-auto sm:pb-1 lg:gap-4 xl:gap-5">
              {packs.map((pack) => {
                const isActive = pack.id === filters.packId;
                return (
                  <button
                    type="button"
                    key={pack.id}
                    onClick={() => handlePackChange(pack.id)}
                    className={[
                      'w-full min-w-0 max-w-full overflow-hidden rounded-2xl border p-2 text-left transition sm:min-w-[180px] sm:flex-1 sm:p-3 md:p-4 lg:p-5 xl:p-6',
                      isActive
                        ? 'border-emerald-400/60 bg-emerald-500/10 shadow-inner shadow-emerald-500/20'
                        : 'border-white/10 bg-slate-900/40 hover:border-emerald-300/40',
                    ].join(' ')}
                  >
                    <span className="block line-clamp-2 text-xs font-semibold text-white wrap-break-word sm:text-sm md:text-base lg:text-lg">{pack.title}</span>
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-300 wrap-break-word sm:mt-2 sm:line-clamp-3 sm:text-xs md:text-sm lg:text-base">{pack.description}</p>
                    <div className="mt-2 flex min-w-0 flex-wrap gap-1 overflow-hidden text-[9px] uppercase tracking-wide text-emerald-200 sm:gap-2 sm:text-[10px] md:text-xs lg:text-sm">
                      {pack.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="shrink-0 rounded-full border border-emerald-400/30 px-1.5 py-0.5 sm:px-2 md:px-2.5 lg:px-3"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedPack?.inspiration && (
              <p className="text-xs text-slate-400">
                Inspiration: <span className="text-slate-200">{selectedPack.inspiration}</span>
              </p>
            )}
          </section>
        )}

        <div className="grid min-w-0 gap-2 overflow-hidden sm:grid-cols-2 lg:gap-3 xl:gap-4">
          <label className="flex min-w-0 flex-col gap-1 overflow-hidden text-[11px] text-slate-300 sm:text-sm md:text-base lg:text-lg">
            Theme
            <select
              className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-800/70 px-2 py-1.5 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20 sm:px-3 sm:py-2 md:text-base lg:px-4 lg:py-2.5 lg:text-lg"
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
          <label className="flex min-w-0 flex-col gap-1 overflow-hidden text-[11px] text-slate-300 sm:text-sm md:text-base lg:text-lg">
            Audience
            <select
              className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-800/70 px-2 py-1.5 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20 sm:px-3 sm:py-2 md:text-base lg:px-4 lg:py-2.5 lg:text-lg"
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
          <label className="flex min-w-0 flex-col gap-1 overflow-hidden text-[11px] text-slate-300 sm:text-sm md:text-base lg:text-lg">
            Problem
            <select
              className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-800/70 px-2 py-1.5 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20 sm:px-3 sm:py-2 md:text-base lg:px-4 lg:py-2.5 lg:text-lg"
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
          <label className="flex min-w-0 flex-col gap-1 overflow-hidden text-[11px] text-slate-300 sm:text-sm md:text-base lg:text-lg">
            Twist
            <select
              className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-800/70 px-2 py-1.5 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20 sm:px-3 sm:py-2 md:text-base lg:px-4 lg:py-2.5 lg:text-lg"
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

        <div className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-800/40 p-2 sm:flex-wrap sm:items-end sm:gap-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6">
          <label className="flex min-w-0 w-full flex-col gap-1 overflow-hidden text-[11px] text-slate-300 sm:flex-1 sm:text-sm md:text-base lg:text-lg">
            Share code (optional)
            <input
              className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-900/60 px-2 py-1.5 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20 sm:px-3 sm:py-2 md:text-base lg:px-4 lg:py-2.5 lg:text-lg"
              placeholder="e.g. A1B2C3D4"
              value={seedDraft}
              maxLength={12}
              onChange={(event) => handleSeedInputChange(event.target.value)}
            />
          </label>
          <div className="flex w-full min-w-0 gap-1.5 overflow-hidden sm:w-auto sm:gap-2 lg:gap-3">
            <button
              type="button"
              className="flex-1 shrink-0 rounded-full border border-white/10 px-2 py-1.5 text-[10px] font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200 disabled:opacity-40 sm:flex-none sm:px-3 sm:py-2 sm:text-xs md:text-sm lg:text-base"
              onClick={handleUseLastSeed}
              disabled={!lastSeed}
            >
              Use last code
            </button>
            <button
              type="button"
              className="flex-1 shrink-0 rounded-full border border-white/10 px-2 py-1.5 text-[10px] font-semibold text-white transition hover:border-rose-400/60 hover:text-rose-200 disabled:opacity-40 sm:flex-none sm:px-3 sm:py-2 sm:text-xs md:text-sm lg:text-base"
              onClick={() => setSeedDraft('')}
              disabled={!seedDraft}
            >
              Clear
            </button>
          </div>
        </div>
        {lastSeed && (
          <p className="text-[10px] text-slate-400 sm:text-xs md:text-sm lg:text-base">
            Last generated code: <span className="text-emerald-200">{lastSeed}</span>
          </p>
        )}

        <div className="mb-4">
          <UsageTracker />
        </div>

        <UpgradePrompt />

        <div className="flex min-w-0 flex-wrap items-center gap-2 overflow-hidden sm:gap-3 lg:gap-4">
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300 active:translate-y-px sm:gap-2 sm:px-4 sm:py-2 sm:text-sm md:text-base lg:px-5 lg:py-2.5 lg:text-lg xl:px-6 xl:py-3"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
          >
            {loading ? 'Generating…' : 'Generate idea'}
          </button>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/60 hover:text-white sm:gap-2 sm:px-4 sm:py-2 sm:text-sm md:text-base lg:px-5 lg:py-2.5 lg:text-lg xl:px-6 xl:py-3"
            onClick={handleClearFilters}
            disabled={loading || Object.keys(filters).length === 0}
          >
            Reset filters
          </button>
          <span className="min-w-0 truncate text-[10px] text-slate-400 sm:text-[11px] md:text-xs lg:text-sm xl:text-base">
            {taxonomy
              ? `${taxonomy.themes.length} themes · ${taxonomy.audiences.length} audiences · ${taxonomy.problems.length} problems · ${taxonomy.twists.length} twists`
              : 'Loading taxonomy…'}
          </span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200 sm:p-4 md:p-5 lg:p-6">
            {error}
          </div>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-slate-800/60 p-2 shadow-inner shadow-slate-900/30 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            {currentIdea ? (
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex flex-col items-start justify-start gap-1.5 sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 lg:gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3">
                    <h3 className="text-base font-semibold text-white sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
                      {currentIdea.headline}
                    </h3>
                    {currentIdea.seed && validationData[currentIdea.seed] && (
                      <ValidationBadge {...validationData[currentIdea.seed]} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 text-[11px] sm:text-xs md:text-sm lg:text-base text-emerald-200">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 lg:px-5 lg:py-2">
                      {currentIdea.theme.title}
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 lg:px-5 lg:py-2">
                      {currentIdea.audience.title}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg lg:text-xl">
                  {currentIdea.elevatorPitch}
                </p>
                <div>
                  <h4 className="text-sm font-semibold text-white/90 sm:text-base md:text-lg lg:text-xl">Talking points</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200 sm:text-base md:text-lg lg:space-y-3">
                    {currentIdea.talkingPoints.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-left leading-relaxed lg:gap-3"
                      >
                        <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400 lg:h-2.5 lg:w-2.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 sm:text-xs md:text-sm lg:text-base lg:gap-3">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/5 px-3 py-0.5 font-semibold uppercase tracking-wide text-emerald-200 md:px-4 md:py-1 lg:px-5 lg:py-1.5">
                    Code: {currentIdea.seed}
                  </span>
                  {currentIdea.originPackId && (
                    <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 font-semibold uppercase tracking-wide text-sky-200 md:px-4 md:py-1.5 lg:px-5 lg:py-2">
                      Pack: {packMap.get(currentIdea.originPackId)?.title ?? currentIdea.originPackId}
                    </span>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300/60 hover:text-emerald-200 md:px-4 md:py-1.5 lg:px-5 lg:py-2 lg:text-base"
                    onClick={handleCopySeed}
                  >
                    Copy code
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                  {currentIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-400/30 bg-emerald-500/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-200 sm:px-3 sm:py-1 sm:text-xs md:text-sm lg:px-4 lg:py-1.5 lg:text-base"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:gap-3 md:gap-4 lg:gap-5">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100 active:translate-y-px sm:w-auto md:px-5 md:py-2.5 md:text-base lg:px-6 lg:py-3 lg:text-lg xl:px-8 xl:py-4"
                    onClick={handleSave}
                  >
                    Save idea
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-emerald-200 sm:w-auto md:px-5 md:py-2.5 md:text-base lg:px-6 lg:py-3 lg:text-lg xl:px-8 xl:py-4"
                    onClick={handleCopy}
                  >
                    Copy pitch
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-300 sm:text-base md:text-lg lg:text-xl">
                {loading ? 'Summoning your first idea…' : 'Generate an idea to see it here.'}
              </div>
            )}
          </article>
        )}
      </div>

      <aside className="flex flex-col gap-3 sm:gap-4 md:self-start lg:gap-5 xl:gap-6">
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl shadow-slate-950/20 sm:p-5 md:p-6 lg:p-8">
          <header className="mb-3 flex items-center justify-between md:mb-4 lg:mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-200 sm:text-sm md:text-base lg:text-lg">
              Recent ideas
            </h3>
            <span className="text-[11px] text-slate-400 sm:text-xs md:text-sm lg:text-base">{history.length} saved</span>
          </header>
          <ul className="space-y-3 md:space-y-4 lg:space-y-5">
            {history.length === 0 ? (
              <li className="text-sm text-slate-400 sm:text-base md:text-lg lg:text-xl">
                Generate ideas to build your creative trail.
              </li>
            ) : (
              history.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-slate-800/60 p-3 transition hover:border-emerald-400/40 md:p-4 lg:p-5"
                >
                  <p className="text-sm font-semibold text-white sm:text-base md:text-lg lg:text-xl">{entry.idea.headline}</p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm md:text-base lg:text-lg">
                    {formatRelativeTime(entry.generatedAt)} · code{' '}
                    <span className="text-emerald-200">{entry.idea.seed}</span>
                    {entry.idea.originPackId
                      ? ` · ${packMap.get(entry.idea.originPackId)?.title ?? entry.idea.originPackId}`
                      : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl shadow-slate-950/20 sm:p-5 md:p-6 lg:p-8">
          <header className="mb-3 flex items-center justify-between md:mb-4 lg:mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-200 sm:text-sm md:text-base lg:text-lg">
              Saved favorites
            </h3>
            <span className="text-[11px] text-slate-400 sm:text-xs md:text-sm lg:text-base">{savedIdeas.length}</span>
          </header>
          <ul className="space-y-3 md:space-y-4 lg:space-y-5">
            {savedIdeas.length === 0 ? (
              <li className="text-sm text-slate-400 sm:text-base md:text-lg lg:text-xl">Save ideas you love to revisit later.</li>
            ) : (
              savedIdeas.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-slate-800/60 p-3 transition hover:border-emerald-400/40 md:p-4 lg:p-5"
                >
                  <p className="text-sm font-semibold text-white sm:text-base md:text-lg lg:text-xl">{entry.idea.headline}</p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm md:text-base lg:text-lg">
                    {entry.idea.audience.title} · {entry.idea.twist.title} · code{' '}
                    <span className="text-emerald-200">{entry.idea.seed}</span>
                    {entry.idea.originPackId
                      ? ` · ${packMap.get(entry.idea.originPackId)?.title ?? entry.idea.originPackId}`
                      : ''}
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

