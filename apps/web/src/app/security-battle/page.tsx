'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SecurityBattlePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [battleHistory, setBattleHistory] = useState<any[]>([]);

  const launchAttack = async (attackType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/security/red-team/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attack_type: attackType,
          target: 'platform',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        // Auto-trigger defense after a moment
        setTimeout(() => {
          triggerDefense(data.attack_id, data.attack_details);
        }, 1500);
      } else {
        setError(data.error || 'Attack failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to launch attack');
    } finally {
      setLoading(false);
    }
  };

  const triggerDefense = async (attackId: string, attackDetails: any) => {
    try {
      const res = await fetch('/api/security/blue-team/defend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attack_id: attackId,
          attack_details: attackDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBattleHistory(prev => [...prev, {
          attack: attackDetails.method,
          defense: data.defense_details.defense_mechanism,
          blocked: data.blocked,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Defense error:', err);
    }
  };

  const runAutoBattle = async (rounds: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/security/auto-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        setBattleHistory(data.results || []);
      } else {
        setError(data.error || 'Battle failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run battle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-white mb-2">🛡️ Security Battle Arena</h1>
        <p className="text-slate-400 mb-8">Red Team (Self-Taught Bot) vs Blue Team (Security Bots)</p>

        {/* Stats */}
        {results && results.success_rate && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Success Rate</div>
              <div className="text-2xl font-bold text-emerald-400">{results.success_rate}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Attacks Blocked</div>
              <div className="text-2xl font-bold text-blue-400">{results.blocked}/{results.rounds}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Rounds</div>
              <div className="text-2xl font-bold text-purple-400">{results.rounds}</div>
            </div>
          </div>
        )}

        {/* Attack Types */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🔴 Red Team Attacks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => launchAttack('sql_injection')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold"
            >
              💉 SQL Injection
            </button>
            <button
              onClick={() => launchAttack('xss')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold"
            >
              ⚡ XSS Attack
            </button>
            <button
              onClick={() => launchAttack('csrf')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold"
            >
              🎯 CSRF
            </button>
            <button
              onClick={() => launchAttack('auth_bypass')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold"
            >
              🔓 Auth Bypass
            </button>
          </div>
        </div>

        {/* Auto Battle */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">⚔️ Auto Battle</h2>
          <div className="flex gap-4">
            <button
              onClick={() => runAutoBattle(5)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? 'Battling...' : '🎮 Run 5 Rounds'}
            </button>
            <button
              onClick={() => runAutoBattle(10)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? 'Battling...' : '🎮 Run 10 Rounds'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="text-red-400 font-semibold">Error</div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Latest Attack/Defense */}
        {results && results.attack_details && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">🔴 Latest Attack</h2>
            <div className="space-y-3">
              <div>
                <div className="text-red-400 font-semibold mb-1">Method</div>
                <div className="text-white">{results.attack_details.method}</div>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold mb-1">Payload</div>
                <div className="text-slate-300 text-sm font-mono bg-slate-900 p-2 rounded">
                  {results.attack_details.payload}
                </div>
              </div>
              <div>
                <div className="text-orange-400 font-semibold mb-1">Vulnerability</div>
                <div className="text-slate-300 text-sm">{results.attack_details.vulnerability}</div>
              </div>
            </div>
          </div>
        )}

        {/* Battle History */}
        {battleHistory.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📜 Battle History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {battleHistory.map((battle, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    battle.blocked
                      ? 'bg-emerald-900/20 border-emerald-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-semibold">Round {i + 1}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      battle.blocked
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {battle.blocked ? '🛡️ Blocked' : '⚠️ Detected'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mb-1">
                    <span className="text-red-400">Attack:</span> {battle.attack}
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-blue-400">Defense:</span> {battle.defense}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📋 How It Works</h2>
          <ol className="list-decimal list-inside text-slate-300 space-y-2 text-sm">
            <li><strong>Red Team (Self-Taught Bot)</strong>: Uses AI to generate realistic attack attempts</li>
            <li><strong>Blue Team (Security Bots)</strong>: Analyzes attacks and generates defense strategies</li>
            <li><strong>Evolution</strong>: Both teams learn from each battle and improve</li>
            <li><strong>Latest Methods</strong>: Security bots implement newest defense techniques</li>
            <li><strong>Continuous Improvement</strong>: System gets stronger with each battle</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
