'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PolicyDepartmentPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/policy-department/list');
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/policy-department/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadAgents();
        alert(`✅ Created ${data.agents.length} Policy/Governance bots!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create department'));
      }
    } catch (error) {
      alert('Error creating department: ' + error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-6xl mx-auto text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Policy & Governance
          </h1>
          <p className="text-xl text-slate-300">
            Company guidelines, automated audits, Q&A on rules/ethics/privacy
          </p>
        </div>

        {agents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
            <p className="text-lg text-slate-300 mb-4">Policy & Governance Department not created yet</p>
            <button
              onClick={createDepartment}
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {creating ? 'Creating...' : 'Create Policy & Governance Department'}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.metadata?.icon || '📜'}</span>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">{agent.metadata?.description || ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300"
                    >
                      {cap.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

