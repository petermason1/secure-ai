'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BotHubPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    fetchMessages();
    fetchConflicts();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/bot-hub/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // In production, this would fetch from /api/bot-hub/messages
      // For now, using mock data
      setMessages([]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchConflicts = async () => {
    try {
      const res = await fetch('/api/bot-hub/conflicts?status=open');
      const data = await res.json();
      setConflicts(data.conflicts || []);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'idle': return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              BH
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Bot Data Centre
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                Communications Hub
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
            Agent Status
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            All registered agents and their current status
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Loading agents...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.agent_id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{agent.agent_id}</p>
                {agent.capabilities && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap: string) => (
                      <span
                        key={cap}
                        className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Active Conflicts
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Conflicts detected between agents (automatic detection)
          </p>
        </div>

        {conflicts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center text-green-300">
            No active conflicts detected ✅
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{conflict.type} Conflict</h3>
                    <p className="mt-1 text-sm text-slate-300">{conflict.description}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${getSeverityColor(conflict.severity)}`}>
                    {conflict.severity}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {conflict.agents?.map((agent: string) => (
                    <span
                      key={agent}
                      className="rounded-full bg-slate-800/60 px-2 py-1 text-xs text-slate-300"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="font-semibold text-white">How It Works</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Agents work independently by default</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Hub routes messages between agents when needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Automatic conflict detection on every action</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Conflicts are logged and escalated when needed</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

