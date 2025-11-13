'use client';

import { useState } from 'react';

type Decision = {
  id: string;
  title: string;
  description: string;
  impact: string;
  risk: 'Low' | 'Medium' | 'High';
  financialImpact: number;
  projectedReturn?: string;
  department: string;
  aiScore: number;
  deadline: string;
};

export default function CEODashboard() {
  const [decisions] = useState<Decision[]>([
    {
      id: '1',
      title: 'Equity Deal - "FitTech AI"',
      description: '15% equity for growth services. 5k users, £2k MRR. £50B fitness market.',
      impact: 'Year 1: £7.5k/year | Year 3: £300k/year | Exit: £3M',
      risk: 'Medium',
      financialImpact: 0,
      projectedReturn: '£3M (exit)',
      department: 'Sales',
      aiScore: 8.5,
      deadline: '24 hours'
    },
    {
      id: '2',
      title: 'Increase Ad Spend - SmartRaceCards',
      description: 'Increase monthly budget £10k → £25k. Current ROI: 10x.',
      impact: 'Additional £100k/month revenue, £85k/month net profit',
      risk: 'Low',
      financialImpact: 15000,
      projectedReturn: '£85k/month profit',
      department: 'Advertising',
      aiScore: 9.2,
      deadline: '48 hours'
    },
    {
      id: '3',
      title: 'Launch API Automation Tool',
      description: 'Build API automation service. 4 weeks dev, £0 cost.',
      impact: 'Year 1: £1.2M ARR | Year 3: £60M ARR | Valuation: +£50M',
      risk: 'Medium',
      financialImpact: 0,
      projectedReturn: '+£50M valuation',
      department: 'Product',
      aiScore: 8.8,
      deadline: '1 week'
    }
  ]);

  const [responses, setResponses] = useState<Record<string, 'yes' | 'no' | null>>({});

  function handleDecision(id: string, decision: 'yes' | 'no') {
    setResponses({ ...responses, [id]: decision });
    // In production: send to backend, execute decision
    console.log(`Decision ${id}: ${decision.toUpperCase()}`);
  }

  const pendingCount = Object.values(responses).filter(r => r === null).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            CEO Dashboard
          </h1>
          <p className="text-slate-400">Daily decision brief - {new Date().toLocaleDateString()}</p>
        </div>

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Revenue (Yesterday)</p>
            <p className="text-2xl font-bold text-emerald-400">£12,450</p>
            <p className="text-xs text-emerald-300 mt-1">↑ 15% vs. avg</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">New Signups</p>
            <p className="text-2xl font-bold text-white">47</p>
            <p className="text-xs text-emerald-300 mt-1">↑ 8%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Ad ROI</p>
            <p className="text-2xl font-bold text-white">8.2x</p>
            <p className="text-xs text-slate-300 mt-1">£82k / £10k</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Valuation</p>
            <p className="text-2xl font-bold text-white">£115.3M</p>
            <p className="text-xs text-emerald-300 mt-1">↑ £220k</p>
          </div>
        </div>

        {/* Decisions Needed */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Decisions Needed ({decisions.length})</h2>
            <span className="text-sm text-slate-400">Est. time: 2 minutes</span>
          </div>

          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <div
                key={decision.id}
                className={`rounded-xl border p-6 transition ${
                  responses[decision.id] === 'yes'
                    ? 'border-emerald-400/50 bg-emerald-500/10'
                    : responses[decision.id] === 'no'
                    ? 'border-rose-400/50 bg-rose-500/10'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-slate-500">{index + 1}</span>
                      <h3 className="text-lg font-semibold text-white">{decision.title}</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{decision.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      decision.risk === 'High' ? 'bg-rose-500/20 text-rose-300' :
                      decision.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {decision.risk} Risk
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                      AI: {decision.aiScore}/10
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4 mb-4">
                  <p className="text-sm font-semibold text-white mb-2">Projected Impact:</p>
                  <p className="text-sm text-slate-300">{decision.impact}</p>
                  {decision.financialImpact > 0 && (
                    <p className="text-xs text-slate-400 mt-2">
                      Cost: £{decision.financialImpact.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!responses[decision.id] ? (
                    <>
                      <button
                        onClick={() => handleDecision(decision.id, 'yes')}
                        className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 transition"
                      >
                        ✓ YES - APPROVE
                      </button>
                      <button
                        onClick={() => handleDecision(decision.id, 'no')}
                        className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:border-white/40 transition"
                      >
                        ✕ NO - REJECT
                      </button>
                      <button className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-white/40 transition">
                        MORE INFO
                      </button>
                    </>
                  ) : (
                    <div className={`flex-1 rounded-lg px-6 py-3 text-center font-semibold ${
                      responses[decision.id] === 'yes'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {responses[decision.id] === 'yes' ? '✓ APPROVED' : '✕ REJECTED'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span>Department: {decision.department}</span>
                  <span>Deadline: {decision.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Approved Actions */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">✅ Auto-Approved Today (47 actions)</h3>
          <div className="grid gap-2 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>• 12 blog posts published</span>
              <span className="text-emerald-400">£0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• 8 ad campaigns optimized</span>
              <span className="text-emerald-400">£2.4k saved</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• 15 sales emails sent</span>
              <span className="text-emerald-400">3 responses</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• 5 social media posts</span>
              <span className="text-emerald-400">2.1k engagement</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• 7 customer support tickets resolved</span>
              <span className="text-emerald-400">NPS: 9.2</span>
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Weekly Trends</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-400 mb-1">Revenue</p>
              <p className="text-xl font-bold text-emerald-400">↑ 15%</p>
              <p className="text-xs text-slate-400">week-over-week</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-400 mb-1">Signups</p>
              <p className="text-xl font-bold text-emerald-400">↑ 8%</p>
              <p className="text-xs text-slate-400">week-over-week</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-400 mb-1">Churn</p>
              <p className="text-xl font-bold text-emerald-400">↓ 2%</p>
              <p className="text-xs text-slate-400">now 3.5%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-400 mb-1">NPS</p>
              <p className="text-xl font-bold text-white">72</p>
              <p className="text-xs text-emerald-300">excellent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
