'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EffortMetrics } from '@/app/components/bot-hud/EffortMetrics';

interface AgentEffort {
  agent_id: string;
  agent_name: string;
  total_hours: number;
  total_tasks: number;
  avg_priority: number;
  total_resources: number;
  avg_effort_score: number;
}

export default function BotEffortMetricsPage() {
  const [agents, setAgents] = useState<AgentEffort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/effort/metrics?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Bot Effort Metrics</h1>
            <p className="text-slate-400">Track and manage effort applied to each bot</p>
          </div>
          
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  period === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading metrics...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">All Bots (Sorted by Effort Score)</h2>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.agent_id}
                    onClick={() => setSelectedAgent(agent.agent_id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAgent === agent.agent_id
                        ? 'bg-emerald-900/20 border-emerald-500'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{agent.agent_name}</div>
                      <div className="text-emerald-400 font-bold">
                        {agent.avg_effort_score.toFixed(1)} pts
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-slate-400">
                      <div>{agent.total_hours.toFixed(1)}h</div>
                      <div>{agent.total_tasks} tasks</div>
                      <div>{agent.avg_priority.toFixed(0)}% priority</div>
                      <div>{agent.total_resources.toFixed(1)} res</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {selectedAgent ? (
                <EffortMetrics
                  agentId={selectedAgent}
                  agentName={agents.find(a => a.agent_id === selectedAgent)?.agent_name || 'Unknown'}
                />
              ) : (
                <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
                  <div className="text-4xl mb-4">👈</div>
                  <div className="text-slate-400">Select a bot to view detailed effort metrics</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
