'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MasterDashboard() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    messagesToday: 0,
    conflicts: 0,
    filesStored: 0,
    departments: 0,
  });

  useEffect(() => {
    // Fetch real stats in production
    setStats({
      totalAgents: 42,
      activeAgents: 38,
      messagesToday: 127,
      conflicts: 2,
      filesStored: 1248,
      departments: 15,
    });
  }, []);

  const departments = [
    {
      name: 'Bot Data Centre',
      description: 'Central communications hub for all agents',
      href: '/bot-hub',
      icon: '🔗',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Post Team',
      description: 'Scans and routes all incoming messages',
      href: '/post-team',
      icon: '📬',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Storage & Filing',
      description: 'AI-powered file organization and search',
      href: '/storage',
      icon: '📁',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Social Media',
      description: 'Content creation, scheduling, engagement',
      href: '/social-media',
      icon: '📱',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Media Team',
      description: 'Press relations, content production, brand',
      href: '/media-team',
      icon: '📺',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Sales Agent',
      description: 'Autonomous lead qualification and routing',
      href: '/sales-agent',
      icon: '💼',
      status: 'active',
      agents: 1,
    },
    {
      name: 'CEO Dashboard',
      description: 'High-level decisions and strategic overview',
      href: '/ceo-dashboard',
      icon: '👔',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Consigliere',
      description: 'Strategic advisor and project analyzer',
      href: '/consigliere',
      icon: '🧠',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Health & Safety',
      description: 'Workplace safety and compliance monitoring',
      href: '/health-safety',
      icon: '🛡️',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Training',
      description: 'AI-powered course generation and tracking',
      href: '/training',
      icon: '🎓',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Legal Department',
      description: 'Smart contracts, agreements, risk/compliance, policy drafting',
      href: '/legal-department',
      icon: '⚖️',
      status: 'active',
      agents: 6,
    },
    {
      name: 'HR Department',
      description: 'Onboarding, contracts, compliance, reviews, leave tracking',
      href: '/hr-department',
      icon: '👥',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Policy & Governance',
      description: 'Company guidelines, automated audits, Q&A on rules/ethics/privacy',
      href: '/policy-department',
      icon: '📜',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Recruitment Consultant',
      description: 'Analyzes skill gaps, recommends human hires, forecasts cost/value',
      href: '/recruitment-consultant',
      icon: '🎯',
      status: 'active',
      agents: 4,
    },
    {
      name: 'Security Advisory',
      description: 'Ask security team for input on privacy, security, and code protection',
      href: '/security-advisory',
      icon: '🔒',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Woke Policy',
      description: 'Language audit, bias detection, inclusivity',
      href: '/woke-policy',
      icon: '✨',
      status: 'pending',
      agents: 6,
    },
    {
      name: 'Psychology',
      description: 'Psychological analysis and insights',
      href: '/psychology',
      icon: '🧘',
      status: 'pending',
      agents: 6,
    },
    {
      name: 'Valuation Tracker',
      description: 'Real-time monetary worth calculation',
      href: '/valuation',
      icon: '💰',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Cloud Agent Iteration',
      description: 'Multi-level problem solving system',
      href: '/iteration',
      icon: '🔄',
      status: 'active',
      agents: 15,
    },
    {
      name: 'Crypto Trading Bot',
      description: 'AI-powered crypto trading with multiple personalities',
      href: '/crypto-trading',
      icon: '💰',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Well Being Team',
      description: 'Motivational speakers for high-value audience engagement',
      href: '/well-being-team',
      icon: '🌟',
      status: 'active',
      agents: 8,
    },
    {
      name: 'CEO Bot',
      description: 'Top 10 CEOs in history for strategic decision-making',
      href: '/ceo-bot',
      icon: '👔',
      status: 'active',
      agents: 10,
    },
    {
      name: 'Podcast Intelligence',
      description: 'Ingest, transcribe, and analyze podcasts for trends and insights',
      href: '/podcast-intelligence',
      icon: '🎙️',
      status: 'active',
      agents: 1,
    },
    {
      name: 'SEO Department',
      description: 'Technical, Content, Link Building, Analytics, Competitor Intelligence, Local SEO',
      href: '/seo-department',
      icon: '🔍',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Senior Dev Review',
      description: 'Non-AI code expert reviews AI-generated code using traditional methods',
      href: '/senior-dev',
      icon: '👨‍💻',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Accounts Department',
      description: 'Financial management, invoicing, expenses, payments, reporting, tax, and compliance',
      href: '/accounts-department',
      icon: '💰',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Value Optimization',
      description: 'Actions that can add £1M+ in company value instantly',
      href: '/value-optimization',
      icon: '💎',
      status: 'active',
      agents: 1,
    },
    {
      name: 'Code Editor',
      description: 'AI-powered code editor with autocomplete, chat, and code review - similar to Cursor',
      href: '/code-editor',
      icon: '💻',
      status: 'active',
      agents: 6,
    },
    {
      name: 'Blog Department',
      description: 'Autonomous daily blog post creation, content planning, SEO optimization, and analytics',
      href: '/blog-department',
      icon: '✍️',
      status: 'active',
      agents: 5,
    },
  ];

  const tools = [
    { name: 'Christmas Trends & Amazon Revenue', href: '/christmas-trends', icon: '🎄' },
    { name: 'Project Ideas Generator', href: '/project-ideas', icon: '💡' },
    { name: 'Idea Generator', href: '/', icon: '✨' },
    { name: 'Crypto Trading', href: '/crypto-trading', icon: '💰' },
    { name: 'SQL Generator', href: '/tools/sql-generator', icon: '💾' },
    { name: 'SQL Runner', href: '/sql-runner', icon: '🗄️' },
    { name: 'Domain Finder', href: '/tools/domain-finder', icon: '🔍' },
    { name: 'Test Turso', href: '/test-turso', icon: '🧪' },
    { name: 'Document Processor', href: '/api/process-document', icon: '📄' },
    { name: 'API Automation', href: '/api-automation', icon: '🔌' },
    { name: 'AI Meeting', href: '/ai-meeting', icon: '🤝' },
    { name: 'God Mode', href: '/internal/god-mode', icon: '⚡' },
    { name: 'Health Check', href: '/health-check', icon: '🏥' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
                MD
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                  Master Dashboard
                </p>
                <h1 className="text-sm font-semibold text-white sm:text-lg">
                  Central Command Center
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/health-check"
                className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
              >
                🏥 Health
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
              >
                ← Home
              </Link>
            </div>
          </div>
          {/* Quick Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/code-editor" className="text-slate-400 hover:text-emerald-300 hover:underline">Code Editor</Link>
            <span className="text-slate-600">•</span>
            <Link href="/value-optimization" className="text-slate-400 hover:text-emerald-300 hover:underline">Value Opt</Link>
            <span className="text-slate-600">•</span>
            <Link href="/trend-intelligence" className="text-slate-400 hover:text-emerald-300 hover:underline">Trends</Link>
            <span className="text-slate-600">•</span>
            <Link href="/podcast-intelligence" className="text-slate-400 hover:text-emerald-300 hover:underline">Podcasts</Link>
            <span className="text-slate-600">•</span>
            <Link href="/seo-department" className="text-slate-400 hover:text-emerald-300 hover:underline">SEO</Link>
            <span className="text-slate-600">•</span>
            <Link href="/accounts-department" className="text-slate-400 hover:text-emerald-300 hover:underline">Accounts</Link>
            <span className="text-slate-600">•</span>
            <Link href="/senior-dev" className="text-slate-400 hover:text-emerald-300 hover:underline">Senior Dev</Link>
            <span className="text-slate-600">•</span>
            <Link href="/security-advisory" className="text-slate-400 hover:text-emerald-300 hover:underline">Security</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        {/* System Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Agents" value={stats.totalAgents} icon="🤖" />
          <StatCard label="Active Agents" value={stats.activeAgents} icon="✅" />
          <StatCard label="Messages Today" value={stats.messagesToday} icon="📬" />
          <StatCard label="Active Conflicts" value={stats.conflicts} icon="⚠️" />
          <StatCard label="Files Stored" value={stats.filesStored} icon="📁" />
          <StatCard label="Departments" value={stats.departments} icon="🏢" />
        </div>

        {/* Quick Actions */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 p-3 transition hover:border-emerald-400/50 hover:bg-slate-800/60"
              >
                <span className="text-2xl">{tool.icon}</span>
                <span className="font-semibold text-white">{tool.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* All Departments */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">All Departments</h2>
            <span className="text-xs text-slate-400">
              {departments.filter((d) => d.status === 'active').length} active
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {departments.map((dept) => (
              <Link
                key={dept.name}
                href={dept.href}
                className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-emerald-400/50 hover:bg-slate-900/80"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-3xl">{dept.icon}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(dept.status)}`}
                  >
                    {dept.status}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold text-white group-hover:text-emerald-200">
                  {dept.name}
                </h3>
                <p className="mb-3 text-xs text-slate-400">{dept.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{dept.agents} agents</span>
                  <span>•</span>
                  <span className="text-emerald-300 group-hover:text-emerald-200">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Status */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">System Status</h2>
          <div className="space-y-3">
            <StatusItem
              label="Bot Data Centre"
              status="operational"
              message="All agents connected"
            />
            <StatusItem
              label="Message Bus"
              status="operational"
              message="127 messages processed today"
            />
            <StatusItem
              label="Conflict Detection"
              status="operational"
              message="2 conflicts detected, 0 critical"
            />
            <StatusItem
              label="Storage System"
              status="operational"
              message="1,248 files indexed"
            />
            <StatusItem
              label="AI Services"
              status="operational"
              message="All services responding"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
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

function StatusItem({
  label,
  status,
  message,
}: {
  label: string;
  status: string;
  message: string;
}) {
  const statusColor =
    status === 'operational'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/40 p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-white">{label}</h4>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
            {status}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{message}</p>
      </div>
    </div>
  );
}
