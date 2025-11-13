'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚀</div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/20">
                Settings
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="mb-8 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'agents', label: 'AI Agents', icon: '🤖' },
            { id: 'social', label: 'Social Media', icon: '📱' },
            { id: 'training', label: 'Training', icon: '🎓' },
            { id: 'tools', label: 'Tools', icon: '🛠️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active Agents" value="6" change="+2 this week" trend="up" icon="🤖" />
              <StatCard label="Posts Generated" value="142" change="+24 today" trend="up" icon="📝" />
              <StatCard label="Courses Completed" value="8" change="2 in progress" trend="neutral" icon="🎓" />
              <StatCard label="API Calls" value="1.2k" change="-5% vs last week" trend="down" icon="⚡" />
            </div>

            {/* Quick Actions */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <QuickAction icon="✨" label="Generate Idea" href="/packs" />
                <QuickAction icon="🔍" label="Find Domain" href="/tools/domain-finder" />
                <QuickAction icon="💾" label="Generate SQL" href="/tools/sql-generator" />
                <QuickAction icon="📱" label="Create Post" href="/dashboard?tab=social" />
                <QuickAction icon="🎓" label="Start Course" href="/dashboard?tab=training" />
                <QuickAction icon="🤖" label="Configure Agent" href="/dashboard?tab=agents" />
              </div>
            </section>

            {/* Recent Activity */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <ActivityItem
                  icon="🤖"
                  title="Content Agent generated 3 posts"
                  time="2 minutes ago"
                  status="success"
                />
                <ActivityItem
                  icon="📊"
                  title="Analytics Agent completed weekly report"
                  time="1 hour ago"
                  status="success"
                />
                <ActivityItem
                  icon="🎓"
                  title="You completed 'Supabase RLS Basics'"
                  time="3 hours ago"
                  status="success"
                />
                <ActivityItem
                  icon="⚠️"
                  title="Sales Agent: Lead scoring failed"
                  time="5 hours ago"
                  status="error"
                />
              </div>
            </section>
          </div>
        )}

        {/* AI Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">AI Agents</h2>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-400">
                + New Agent
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AgentCard
                name="Content Generator"
                type="Social Media"
                status="active"
                lastRun="2 min ago"
                nextRun="In 58 min"
              />
              <AgentCard
                name="Sales Agent"
                type="Lead Qualification"
                status="active"
                lastRun="1 hour ago"
                nextRun="In 23 hours"
              />
              <AgentCard
                name="Training Agent"
                type="Documentation"
                status="paused"
                lastRun="2 days ago"
                nextRun="Paused"
              />
              <AgentCard
                name="Analytics Agent"
                type="Reporting"
                status="active"
                lastRun="3 hours ago"
                nextRun="In 21 hours"
              />
              <AgentCard
                name="Engagement Agent"
                type="Social Media"
                status="active"
                lastRun="5 min ago"
                nextRun="In 55 min"
              />
              <AgentCard
                name="Partnership Agent"
                type="Outreach"
                status="error"
                lastRun="1 day ago"
                nextRun="Error - needs attention"
              />
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Social Media</h2>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-400">
                Generate Post
              </button>
            </div>

            {/* Pending Approval */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pending Approval (3)</h3>
              <div className="space-y-4">
                <SocialPostCard
                  platform="twitter"
                  content="🚀 Just shipped our SQL Generator tool! Generate production-ready PostgreSQL schemas from natural language. No SQL knowledge required. Try it now: [link]"
                  status="draft"
                  generatedAt="10 min ago"
                />
                <SocialPostCard
                  platform="linkedin"
                  content="Excited to announce our new Domain Finder tool. Check domain availability and get smart suggestions for your next project. Built with developers in mind."
                  status="draft"
                  generatedAt="15 min ago"
                />
                <SocialPostCard
                  platform="twitter"
                  content="💡 Pro tip: Use our AI agents to automate your entire social media workflow. Content generation, scheduling, and engagement - all handled automatically."
                  status="draft"
                  generatedAt="1 hour ago"
                />
              </div>
            </section>

            {/* Scheduled Posts */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Scheduled (5)</h3>
              <div className="space-y-2">
                <ScheduledItem platform="twitter" time="Today at 2:00 PM" />
                <ScheduledItem platform="linkedin" time="Today at 5:00 PM" />
                <ScheduledItem platform="twitter" time="Tomorrow at 10:00 AM" />
                <ScheduledItem platform="instagram" time="Tomorrow at 3:00 PM" />
                <ScheduledItem platform="linkedin" time="Friday at 9:00 AM" />
              </div>
            </section>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Training</h2>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-400">
                Browse Courses
              </button>
            </div>

            {/* Progress Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Courses Enrolled" value="12" icon="📚" />
              <StatCard label="Completed" value="8" icon="✅" />
              <StatCard label="Certificates" value="5" icon="🏆" />
            </div>

            {/* In Progress */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">In Progress</h3>
              <div className="space-y-4">
                <CourseCard
                  title="Mastering Supabase RLS"
                  progress={65}
                  modules="8/12 modules"
                  timeLeft="2 hours left"
                />
                <CourseCard
                  title="Advanced AI Agent Patterns"
                  progress={30}
                  modules="3/10 modules"
                  timeLeft="5 hours left"
                />
              </div>
            </section>

            {/* Recommended */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <RecommendedCourse title="Zero-Trust Security" difficulty="Advanced" duration="4 hours" />
                <RecommendedCourse title="Building AI Workflows" difficulty="Intermediate" duration="3 hours" />
                <RecommendedCourse title="PostgreSQL Performance" difficulty="Advanced" duration="5 hours" />
              </div>
            </section>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tools</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ToolCard
                icon="💾"
                title="SQL Generator"
                description="Generate production-ready PostgreSQL schemas from natural language"
                href="/tools/sql-generator"
                badge="New"
              />
              <ToolCard
                icon="🔍"
                title="Domain Finder"
                description="Check domain availability and get smart suggestions"
                href="/tools/domain-finder"
                badge="New"
              />
              <ToolCard
                icon="✨"
                title="Idea Generator"
                description="AI-powered idea generation with validation"
                href="/packs"
              />
              <ToolCard
                icon="🤖"
                title="Sales Agent"
                description="Autonomous lead qualification and routing"
                href="/sales-agent"
              />
              <ToolCard
                icon="📄"
                title="Document Processor"
                description="Extract structured data from documents"
                href="/api/process-document"
                badge="API"
              />
              <ToolCard
                icon="💬"
                title="RAG Chatbot"
                description="Knowledge base chatbot with vector search"
                href="/api/chat-rag"
                badge="API"
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics</h2>

            {/* Usage Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="API Calls" value="1,247" change="+12% vs last week" trend="up" />
              <StatCard label="AI Cost" value="$24.50" change="+$3.20 vs last week" trend="up" />
              <StatCard label="Success Rate" value="94.2%" change="+1.5% vs last week" trend="up" />
              <StatCard label="Avg Response" value="1.8s" change="-0.3s vs last week" trend="down" />
            </div>

            {/* Charts Placeholder */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Usage Over Time</h3>
              <div className="flex h-64 items-center justify-center rounded-lg border border-white/10 bg-slate-800/40">
                <p className="text-slate-400">Chart visualization coming soon</p>
              </div>
            </section>

            {/* Top Features */}
            <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Most Used Features</h3>
              <div className="space-y-3">
                <FeatureUsage name="Content Generator" usage={342} percentage={27} />
                <FeatureUsage name="SQL Generator" usage={198} percentage={16} />
                <FeatureUsage name="Domain Finder" usage={156} percentage={13} />
                <FeatureUsage name="Sales Agent" usage={124} percentage={10} />
                <FeatureUsage name="Idea Generator" usage={89} percentage={7} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ label, value, change, trend, icon }: any) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400'
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-semibold ${trend ? trendColors[trend] : 'text-slate-400'}`}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>
    </div>
  );
}

// Component: Quick Action
function QuickAction({ icon, label, href }: any) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-800/40 p-4 transition hover:border-emerald-400/50 hover:bg-slate-800/60"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-white">{label}</span>
    </a>
  );
}

// Component: Activity Item
function ActivityItem({ icon, title, time, status }: any) {
  const statusColors = {
    success: 'border-emerald-400/30 bg-emerald-500/10',
    error: 'border-rose-400/30 bg-rose-500/10',
    info: 'border-sky-400/30 bg-sky-500/10'
  };

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${statusColors[status] || statusColors.info}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

// Component: Agent Card
function AgentCard({ name, type, status, lastRun, nextRun }: any) {
  const statusConfig = {
    active: { color: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200', icon: '✓' },
    paused: { color: 'border-amber-400/30 bg-amber-500/10 text-amber-200', icon: '⏸' },
    error: { color: 'border-rose-400/30 bg-rose-500/10 text-rose-200', icon: '✕' }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-xs text-slate-400">{type}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${config.color}`}>
          {config.icon} {status}
        </span>
      </div>
      <div className="space-y-1 text-xs text-slate-400">
        <p>Last run: {lastRun}</p>
        <p>Next run: {nextRun}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:border-white/20">
          Configure
        </button>
        <button className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400">
          Run Now
        </button>
      </div>
    </div>
  );
}

// Component: Social Post Card
function SocialPostCard({ platform, content, status, generatedAt }: any) {
  const platformIcons: any = {
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📸',
    facebook: '👥'
  };

  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{platformIcons[platform]}</span>
          <span className="text-xs font-semibold uppercase text-slate-400">{platform}</span>
        </div>
        <span className="text-xs text-slate-500">{generatedAt}</span>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{content}</p>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400">
          Approve
        </button>
        <button className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:border-white/20">
          Edit
        </button>
        <button className="rounded-lg border border-rose-400/30 px-3 py-2 text-sm font-semibold text-rose-200 hover:border-rose-400/50">
          Reject
        </button>
      </div>
    </div>
  );
}

// Component: Scheduled Item
function ScheduledItem({ platform, time }: any) {
  const platformIcons: any = {
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📸',
    facebook: '👥'
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/40 p-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{platformIcons[platform]}</span>
        <span className="text-sm font-semibold text-white capitalize">{platform}</span>
      </div>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  );
}

// Component: Course Card
function CourseCard({ title, progress, modules, timeLeft }: any) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
      <h4 className="font-semibold text-white">{title}</h4>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{modules}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">{timeLeft}</p>
      </div>
      <button className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400">
        Continue
      </button>
    </div>
  );
}

// Component: Recommended Course
function RecommendedCourse({ title, difficulty, duration }: any) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
      <h4 className="font-semibold text-white">{title}</h4>
      <div className="mt-2 flex gap-2">
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{difficulty}</span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{duration}</span>
      </div>
      <button className="mt-4 w-full rounded-lg border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10">
        Enroll
      </button>
    </div>
  );
}

// Component: Tool Card
function ToolCard({ icon, title, description, href, badge }: any) {
  return (
    <a
      href={href}
      className="rounded-xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-emerald-400/50"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {badge && (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </a>
  );
}

// Component: Feature Usage
function FeatureUsage({ name, usage, percentage }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-200">{name}</span>
        <span className="text-sm font-semibold text-slate-400">{usage} calls</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-teal-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
