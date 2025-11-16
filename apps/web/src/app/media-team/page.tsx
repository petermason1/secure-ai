'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MediaTeamPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pressReleases, setPressReleases] = useState<any[]>([]);
  const [mentions, setMentions] = useState<any[]>([]);
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [crises, setCrises] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    pressMentions: 0,
    contentProduced: 0,
    brandScore: 95,
  });

  useEffect(() => {
    // Fetch data in production
    setCampaigns([
      {
        id: '1',
        name: 'Product Launch Q1 2025',
        type: 'product_launch',
        status: 'active',
        startDate: '2025-01-20',
        budget: 50000,
        reach: 2500000,
      },
      {
        id: '2',
        name: 'Brand Awareness Campaign',
        type: 'brand_awareness',
        status: 'planned',
        startDate: '2025-02-01',
        budget: 30000,
      },
    ]);

    setPressReleases([
      {
        id: '1',
        title: 'Why.ai Launches New AI Feature',
        status: 'published',
        publishedAt: '2025-01-15',
        coverage: 12,
      },
      {
        id: '2',
        title: 'Why.ai Raises $10M Series A',
        status: 'scheduled',
        releaseDate: '2025-01-25',
      },
    ]);

    setMentions([
      {
        id: '1',
        source: 'TechCrunch',
        title: 'Why.ai Raises $10M to Build AI Platform',
        url: '#',
        sentiment: 'positive',
        date: '2025-01-15',
      },
      {
        id: '2',
        source: 'The Verge',
        title: 'Why.ai Launches Revolutionary AI Tool',
        url: '#',
        sentiment: 'positive',
        date: '2025-01-14',
      },
    ]);

    setContentQueue([
      {
        id: '1',
        type: 'video',
        title: 'Product Demo Video',
        status: 'in_progress',
        assignedTo: 'Content Producer',
      },
      {
        id: '2',
        type: 'article',
        title: 'How AI is Changing Business',
        status: 'requested',
        assignedTo: 'Content Producer',
      },
    ]);

    setCrises([]);

    setStats({
      activeCampaigns: 2,
      pressMentions: 45,
      contentProduced: 23,
      brandScore: 95,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'planned':
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'in_progress':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'requested':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-300';
      case 'negative':
        return 'text-red-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              MT
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Media Team
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                Unified Media Department
              </h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} icon="📺" />
          <StatCard label="Press Mentions" value={stats.pressMentions} icon="📰" />
          <StatCard label="Content Produced" value={stats.contentProduced} icon="🎬" />
          <StatCard label="Brand Score" value={`${stats.brandScore}%`} icon="⭐" />
        </div>

        {/* Active Campaigns */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Active Campaigns</h2>
            <button className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:px-4 sm:text-sm">
              + New Campaign
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{campaign.name}</h3>
                    <p className="mt-1 text-xs text-slate-400 capitalize">{campaign.type}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(campaign.status)}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="text-white">£{campaign.budget?.toLocaleString()}</span>
                  </div>
                  {campaign.reach && (
                    <div className="flex justify-between">
                      <span>Reach:</span>
                      <span className="text-white">{campaign.reach.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Start:</span>
                    <span className="text-white">{campaign.startDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Press Releases & Mentions */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Press Releases */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white sm:text-xl">Press Releases</h2>
              <button className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm">
                + New
              </button>
            </div>
            <div className="space-y-3">
              {pressReleases.map((release) => (
                <div
                  key={release.id}
                  className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-white">{release.title}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(release.status)}`}
                    >
                      {release.status}
                    </span>
                  </div>
                  {release.publishedAt && (
                    <p className="text-xs text-slate-400">
                      Published: {release.publishedAt} • {release.coverage} articles
                    </p>
                  )}
                  {release.releaseDate && (
                    <p className="text-xs text-slate-400">Scheduled: {release.releaseDate}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Media Mentions */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white sm:text-xl">Media Mentions</h2>
              <span className="text-xs text-slate-400">{mentions.length} recent</span>
            </div>
            <div className="space-y-3">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="rounded-lg border border-white/10 bg-slate-800/40 p-3"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{mention.title}</h3>
                      <p className="mt-1 text-xs text-slate-400">{mention.source}</p>
                    </div>
                    <span
                      className={`text-xs font-medium ${getSentimentColor(mention.sentiment)}`}
                    >
                      {mention.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{mention.date}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Content Production Queue */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Content Production</h2>
            <button className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm">
              + Request Content
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentQueue.map((content) => (
              <div
                key={content.id}
                className="rounded-lg border border-white/10 bg-slate-800/40 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-lg">
                        {content.type === 'video' ? '🎬' : content.type === 'article' ? '📝' : '🎨'}
                      </span>
                      <span className="text-xs font-medium uppercase text-slate-400">
                        {content.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{content.title}</h3>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(content.status)}`}
                  >
                    {content.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Assigned to: {content.assignedTo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Crisis Communications */}
        {crises.length > 0 ? (
          <section className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-red-300 sm:text-xl">
              Active Crises ({crises.length})
            </h2>
            <div className="space-y-3">
              {crises.map((crisis) => (
                <div
                  key={crisis.id}
                  className="rounded-lg border border-red-500/40 bg-red-500/20 p-4"
                >
                  <h3 className="font-semibold text-red-200">{crisis.description}</h3>
                  <p className="mt-2 text-sm text-red-300">{crisis.response_strategy}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-300">No Active Crises</h3>
                <p className="text-sm text-green-200">All systems monitoring normally</p>
              </div>
            </div>
          </section>
        )}

        {/* Integration Info */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Coordinates</h3>
              <p className="text-sm text-slate-300">
                Media Team coordinates Social Media + Advertising departments for unified campaigns
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Press Relations</h3>
              <p className="text-sm text-slate-300">
                Manages press releases, media coverage, and journalist relationships
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Content Production</h3>
              <p className="text-sm text-slate-300">
                Produces videos, articles, graphics, and all media content
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Brand Management</h3>
              <p className="text-sm text-slate-300">
                Ensures brand consistency across all channels and media
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Crisis Communications</h3>
              <p className="text-sm text-slate-300">
                Handles negative media, PR issues, and crisis situations
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="mb-2 font-semibold text-white">Media Analytics</h3>
              <p className="text-sm text-slate-300">
                Tracks mentions, sentiment, reach, and ROI of all media activities
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>
    </div>
  );
}


