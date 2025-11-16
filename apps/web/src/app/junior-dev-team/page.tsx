'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JuniorDev {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  config: any;
  metadata: any;
  created_at: string;
}

export default function JuniorDevTeamPage() {
  const [agents, setAgents] = useState<JuniorDev[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/junior-dev-team/list');
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

  const createTeam = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/junior-dev-team/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadAgents();
        alert(`✅ Created ${data.agents.length} junior dev bots!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create team'));
      }
    } catch (error) {
      alert('Error creating team: ' + error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">👨‍💻 Junior Dev Team</h1>
          <p className="text-slate-300">
            Team of AI junior developers for code review, bug fixes, testing, and documentation
          </p>
        </div>

        {agents.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-300 mb-4">No junior dev bots created yet.</p>
            <button
              onClick={createTeam}
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {creating ? 'Creating...' : '🚀 Create Junior Dev Team'}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-white">
                <span className="text-2xl font-bold">{agents.length}</span>
                <span className="text-slate-400 ml-2">Junior Dev Bots</span>
              </div>
              <button
                onClick={createTeam}
                disabled={creating}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {creating ? 'Creating...' : '+ Add More'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{agent.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          agent.status === 'active'
                            ? 'bg-emerald-900 text-emerald-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Capabilities:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {cap.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Created: {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
