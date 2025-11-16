'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SeniorDevTeamPage() {
  const [count, setCount] = useState(100);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTeam = async () => {
    if (count < 1 || count > 1000) {
      alert('Please enter a number between 1 and 1000');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/senior-dev-team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        alert(`✅ Created ${data.count} senior dev bots!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create team'));
      }
    } catch (error) {
      alert('Error creating team: ' + error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/bot-activity-hud" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Bot Activity HUD
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">👨‍💼 Senior Dev Team</h1>
          <p className="text-slate-300">Create as many senior dev bots as you need</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Create Senior Dev Team</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Senior Dev Bots
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 100)}
                min="1"
                max="1000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-2xl font-bold"
              />
              <p className="text-slate-400 text-sm mt-2">
                Recommended: 100 for maximum parallelization and no bottlenecks
              </p>
            </div>

            <button
              onClick={createTeam}
              disabled={creating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-semibold text-lg"
            >
              {creating ? `🔄 Creating ${count} Senior Devs...` : `🚀 Create ${count} Senior Dev Bots`}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">✅ Team Created!</h2>
            <div className="text-slate-300 space-y-2">
              <p><strong>Total Created:</strong> {result.count} senior dev bots</p>
              <p><strong>Department:</strong> {result.department.name}</p>
              <p className="text-emerald-400">{result.message}</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">💡 Why 100 Senior Devs?</h2>
          <div className="text-slate-300 space-y-3">
            <p>✅ <strong>Massive Parallel Processing</strong> - Review 100 PRs simultaneously</p>
            <p>✅ <strong>No Bottlenecks</strong> - Never wait for a senior to be available</p>
            <p>✅ <strong>Always Available</strong> - 24/7 coverage, no queues</p>
            <p>✅ <strong>Minimal Cost</strong> - Using free Gemini AI</p>
            <p>✅ <strong>Redundancy</strong> - If one is busy, 99 others available</p>
            <p>✅ <strong>Scalability</strong> - Can handle any workload</p>
            <p>✅ <strong>Specialization</strong> - Each can focus on specific areas</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Role Distribution</h2>
          <div className="text-slate-300 space-y-2">
            <p>Roles will be distributed evenly:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Senior Architect - System design & architecture</li>
              <li>Senior Code Reviewer - Quality assurance & reviews</li>
              <li>Senior Mentor - Mentoring & team leadership</li>
              <li>Senior Security - Security & compliance</li>
              <li>Senior Performance - Optimization & scaling</li>
            </ul>
            <p className="mt-4 text-sm text-slate-400">
              With {count} bots, you'll have approximately {Math.floor(count / 5)} of each role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
