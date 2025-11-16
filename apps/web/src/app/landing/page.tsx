'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.16),transparent_60%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-8 lg:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base md:text-lg">
              AI
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs md:text-sm">
                Why.ai
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg md:text-xl">
                Autonomous AI Company Builder
              </h1>
            </div>
          </div>
          <nav className="flex w-full flex-col items-stretch gap-2 text-[11px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:text-xs md:w-auto md:flex-nowrap md:justify-end md:text-sm">
            <Link
              href="#features"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Features
            </Link>
            <Link
              href="#security"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Security
            </Link>
            <Link
              href="/health-check"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Health Check
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-3 pb-12 pt-6 sm:px-5 md:pb-18 md:pt-10 lg:px-8">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-start gap-2.5 text-left sm:items-center sm:gap-4 sm:text-center">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 sm:px-4 sm:text-xs">
            Autonomous Intelligence
          </span>
          <h2 className="max-w-3xl text-[24px] font-semibold leading-snug text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Build and scale your company with 20+ autonomous AI departments
          </h2>
          <p className="max-w-2xl text-[13px] leading-relaxed text-slate-300 sm:text-base md:text-lg">
            Every department runs autonomously. HR, Legal, Sales, Marketing, Development, and more—all powered by AI agents that work 24/7.
          </p>
          <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300 sm:w-auto sm:px-5 md:px-6 md:py-3"
            >
              Access Dashboard
            </Link>
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:w-auto sm:px-5 md:px-6 md:py-3"
            >
              {showFeatures ? 'Hide' : 'View'} Features
            </button>
          </div>
        </section>

        {showFeatures && (
          <section id="features" className="mx-auto mt-12 grid w-full max-w-5xl gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-xl shadow-slate-950/30 sm:p-6 sm:gap-6 sm:rounded-3xl md:mt-20 md:grid-cols-3 md:p-8">
            {[
              {
                title: 'HR Department',
                description: 'Automated onboarding, contracts, compliance, reviews, leave tracking',
                href: '/hr-department',
                icon: '👥',
              },
              {
                title: 'Legal Department',
                description: 'Smart contracts, agreements, risk/compliance, policy drafting',
                href: '/legal-department',
                icon: '⚖️',
              },
              {
                title: 'Policy & Governance',
                description: 'Company guidelines, automated audits, Q&A on rules/ethics/privacy',
                href: '/policy-department',
                icon: '📜',
              },
              {
                title: 'Recruitment Consultant',
                description: 'Analyzes skill gaps, recommends human hires, forecasts cost/value',
                href: '/recruitment-consultant',
                icon: '🎯',
              },
              {
                title: 'Security Advisory',
                description: 'Ask security team for input on privacy, security, and code protection',
                href: '/security-advisory',
                icon: '🔒',
              },
              {
                title: 'Accounts Department',
                description: 'Financial management, invoicing, expenses, payments, reporting, tax, and compliance',
                href: '/accounts-department',
                icon: '💰',
              },
              {
                title: 'SEO Department',
                description: 'Technical, Content, Link Building, Analytics, Competitor Intelligence, Local SEO',
                href: '/seo-department',
                icon: '🔍',
              },
              {
                title: 'Podcast Intelligence',
                description: 'Ingest, transcribe, and analyze podcasts for trends and insights',
                href: '/podcast-intelligence',
                icon: '🎙️',
              },
              {
                title: 'Trend Intelligence',
                description: 'Expert in creating organic trending content without paid advertising',
                href: '/trend-intelligence',
                icon: '📈',
              },
              {
                title: 'Value Optimization',
                description: 'Actions that can add £1M+ in company value instantly',
                href: '/value-optimization',
                icon: '💎',
              },
              {
                title: 'Code Editor',
                description: 'AI-powered code editor with autocomplete, chat, and code review - similar to Cursor',
                href: '/code-editor',
                icon: '💻',
              },
              {
                title: 'Blog Department',
                description: 'Autonomous daily blog post creation, content planning, SEO optimization',
                href: '/blog-department',
                icon: '✍️',
              },
              {
                title: 'Senior Dev Review',
                description: 'Non-AI code expert reviews AI-generated code using traditional methods',
                href: '/senior-dev',
                icon: '👨‍💻',
              },
              {
                title: 'CEO Bot',
                description: 'Top 10 CEOs in history for strategic decision-making',
                href: '/ceo-bot',
                icon: '👔',
              },
              {
                title: 'Well Being Team',
                description: 'Motivational speakers for high-value audience engagement',
                href: '/well-being-team',
                icon: '🌟',
              },
              {
                title: 'Crypto Trading Bot',
                description: 'AI-powered crypto trading with multiple personalities',
                href: '/crypto-trading',
                icon: '💰',
              },
              {
                title: 'Sales Agent',
                description: 'Autonomous lead qualification and routing',
                href: '/sales-agent',
                icon: '💼',
              },
              {
                title: 'Social Media',
                description: 'Content creation, scheduling, engagement',
                href: '/social-media',
                icon: '📱',
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-800/40 p-3 transition hover:border-emerald-300/60 hover:bg-slate-800/60 sm:gap-3 sm:p-5"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-base font-semibold text-white sm:text-lg">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{feature.description}</p>
              </Link>
            ))}
          </section>
        )}

        <section
          id="security"
          className="mx-auto mt-12 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-xl shadow-slate-950/30 sm:rounded-3xl sm:p-6 md:mt-20 md:p-8"
        >
          <h3 className="text-base font-semibold text-white sm:text-2xl mb-4">
            🔒 Security & Privacy
          </h3>
          <div className="space-y-4 text-sm text-slate-300">
            <p>
              <strong className="text-emerald-200">Code & Ideas Protected:</strong> All source code, business logic, and proprietary ideas are kept private. Only public-facing features are accessible.
            </p>
            <p>
              <strong className="text-emerald-200">Access Control:</strong> Dashboard and internal tools require authentication. API endpoints are secured with proper authorization.
            </p>
            <p>
              <strong className="text-emerald-200">Data Encryption:</strong> All sensitive data is encrypted at rest and in transit. Environment variables and secrets are never committed.
            </p>
            <p>
              <strong className="text-emerald-200">Compliance:</strong> Built with GDPR, SOC2, and data protection best practices in mind.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 mt-12">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-5 text-[11px] text-slate-400 sm:px-6 sm:text-sm lg:px-8">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Why.ai. All rights reserved. Code and ideas are proprietary.
          </p>
        </div>
      </footer>
    </div>
  );
}

