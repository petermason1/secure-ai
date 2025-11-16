'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreatorEconomyNonprofitPage() {
  const [kpis, setKpis] = useState({
    creatorsOnboarded: 0,
    contentPiecesGenerated: 0,
    revenueGenerated: 0,
    communityEngagement: 0,
  });

  useEffect(() => {
    // Animate KPIs
    const animate = () => {
      setKpis({
        creatorsOnboarded: 127,
        contentPiecesGenerated: 342,
        revenueGenerated: 18400,
        communityEngagement: 89,
      });
    };
    setTimeout(animate, 500);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-teal-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/project-ideas" className="text-emerald-400 hover:text-emerald-300 mb-6 inline-block text-sm">
            ← Back to Project Ideas
          </Link>
          <div className="max-w-3xl">
            <span className="mb-4 inline-block rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              Creator Economy × Non-profit
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
              Creator Economy Co-Pilot for Non-profit Program Leads
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-slate-300">
              Helps independent creators streamline planning, production, and monetization. Designed for mission-driven operators coordinating volunteers, donors, and community programs.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
                <p className="text-xs text-emerald-200">Problem</p>
                <p className="font-semibold text-white">Feedback Latency</p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2">
                <p className="text-xs text-blue-200">Solution</p>
                <p className="font-semibold text-white">AI Companion</p>
              </div>
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2">
                <p className="text-xs text-purple-200">Focus</p>
                <p className="font-semibold text-white">Personalization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated KPIs */}
      <div className="border-b border-white/10 bg-slate-900/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-emerald-400">
                {kpis.creatorsOnboarded.toLocaleString()}
              </div>
              <p className="text-sm text-slate-400">Creators Onboarded</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-400">
                {kpis.contentPiecesGenerated.toLocaleString()}
              </div>
              <p className="text-sm text-slate-400">Content Pieces</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-400">
                £{kpis.revenueGenerated.toLocaleString()}
              </div>
              <p className="text-sm text-slate-400">Revenue Generated</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-pink-400">
                {kpis.communityEngagement}%
              </div>
              <p className="text-sm text-slate-400">Engagement Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Problem Section */}
        <section className="mb-16">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">The Problem</h2>
            <p className="mb-4 text-lg text-slate-300">
              <strong className="text-red-300">Feedback Latency:</strong> Decisions lag because teams wait on reviews, approvals, or delayed customer signals.
            </p>
            <p className="text-slate-300">
              Non-profit program leads struggle with slow feedback loops, making it difficult to adapt content strategies, engage volunteers effectively, and demonstrate impact to donors in real-time.
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-white">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="mb-3 text-xl font-bold text-white">AI Companion</h3>
              <p className="text-slate-300">
                Personalized advice generated by a conversational AI that adapts to user history, learning from past campaigns and community responses.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="mb-3 text-xl font-bold text-white">Instant Feedback</h3>
              <p className="text-slate-300">
                Real-time content suggestions, engagement predictions, and optimization recommendations without waiting for human review cycles.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-3 text-xl font-bold text-white">Impact Tracking</h3>
              <p className="text-slate-300">
                Automated reporting on volunteer engagement, donor conversion, and community growth to demonstrate program effectiveness.
              </p>
            </div>
          </div>
        </section>

        {/* Talking Points */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-white">Key Talking Points</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="mb-2 text-lg font-semibold text-emerald-300">Core Problem</h3>
              <p className="text-slate-300">
                Feedback Latency: Decisions lag because teams wait on reviews, approvals, or delayed customer signals.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-300">Differentiator</h3>
              <p className="text-slate-300">
                AI Companion via AI and personalization - a conversational AI that adapts to user history and provides instant, contextual advice.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="mb-2 text-lg font-semibold text-purple-300">User Journey</h3>
              <p className="text-slate-300">
                Highlights key moments of delight and retention - from initial content creation to community engagement and donor conversion.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="mb-2 text-lg font-semibold text-pink-300">Monetization</h3>
              <p className="text-slate-300">
                Clear monetization hooks: subscriptions, premium templates, or marketplace fees. Opportunities to layer AI suggestions with human curation for trust.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-white">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: '🎯', title: 'Content Planning', desc: 'AI-powered content calendars tailored to non-profit goals' },
              { icon: '💬', title: 'Engagement Optimization', desc: 'Real-time suggestions to boost volunteer and donor engagement' },
              { icon: '📈', title: 'Impact Analytics', desc: 'Track and report on program effectiveness automatically' },
              { icon: '🤝', title: 'Community Management', desc: 'Coordinate volunteers and manage donor relationships' },
              { icon: '💰', title: 'Revenue Streams', desc: 'Identify and optimize monetization opportunities' },
              { icon: '🔄', title: 'Adaptive Learning', desc: 'AI learns from past campaigns to improve future recommendations' },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Build This?</h2>
          <p className="mb-8 text-lg text-slate-300">
            This idea is ready for MVP development. Start with the AI Companion core feature and expand based on user feedback.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Access Dashboard
            </Link>
            <Link
              href="/code-editor"
              className="rounded-full border border-white/20 bg-slate-800/40 px-6 py-3 font-semibold text-white transition hover:border-emerald-300/60"
            >
              Start Coding
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

