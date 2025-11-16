'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IterationPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startIteration = async () => {
    const problem = prompt('Enter problem description:');
    const question = prompt('Enter initial question:');
    
    if (!problem || !question) return;

    setLoading(true);
    try {
      const res = await fetch('/api/iteration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_description: problem,
          initial_question: question,
          max_iterations: 10,
          min_improvement: 10,
        }),
      });
      const data = await res.json();
      setActiveSession(data);
    } catch (error) {
      console.error('Error starting iteration:', error);
    } finally {
      setLoading(false);
    }
  };

  const processLevel = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const res = await fetch('/api/iteration/process-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          level: activeSession.current_level,
          iteration: activeSession.current_iteration,
        }),
      });
      const data = await res.json();
      setActiveSession({
        ...activeSession,
        current_level: data.next_level,
        current_iteration: activeSession.current_iteration + 1,
        best_solution: data.best_solution,
        status: data.status,
      });
    } catch (error) {
      console.error('Error processing level:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              IT
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Cloud Agent Iteration
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                Multi-Level Problem Solving
              </h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Iteration System
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Agents iterate through each company level until the best solution is found
          </p>
        </div>

        {!activeSession ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
            <h3 className="mb-4 text-lg font-semibold text-white">Start New Iteration</h3>
            <p className="mb-6 text-sm text-slate-300">
              Agents will work through all levels to find the best solution
            </p>
            <button
              onClick={startIteration}
              disabled={loading}
              className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Iteration'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Active Session</h3>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  {activeSession.status || 'active'}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Current Level</p>
                  <p className="text-2xl font-bold text-white">{activeSession.current_level} / 4</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Iteration</p>
                  <p className="text-2xl font-bold text-white">{activeSession.current_iteration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Best Score</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {activeSession.best_solution?.score || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Agents</p>
                  <p className="text-2xl font-bold text-white">
                    {activeSession.agents_assigned?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Level Progress</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        level <= activeSession.current_level
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-500/40 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      {level}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        Level {level}:{' '}
                        {level === 1
                          ? 'Operational'
                          : level === 2
                          ? 'Functional'
                          : level === 3
                          ? 'Strategic'
                          : 'Executive'}
                      </p>
                      {level === activeSession.current_level && (
                        <p className="text-xs text-emerald-300">In progress...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Solution */}
            {activeSession.best_solution && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 sm:p-6">
                <h3 className="mb-4 text-lg font-semibold text-emerald-300">Best Solution</h3>
                <p className="text-white">{activeSession.best_solution.solution}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-emerald-200">
                    Score: {activeSession.best_solution.score}
                  </span>
                  <span className="text-sm text-slate-400">
                    From: {activeSession.best_solution.agent}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            {activeSession.status === 'active' && (
              <div className="flex gap-3">
                <button
                  onClick={processLevel}
                  disabled={loading}
                  className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Next Level'}
                </button>
                <button
                  onClick={() => setActiveSession(null)}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/40"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">How It Works</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Level 1 (Operational):</strong> Post Team, Storage, Health & Safety collect
                data and classify the problem
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Level 2 (Functional):</strong> Sales, Social Media, Training, Media Team
                add market perspective
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Level 3 (Strategic):</strong> CEO Dashboard, Consigliere, Legal, HR analyze
                business impact
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Level 4 (Executive):</strong> Final decision and approval
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
              <p className="text-emerald-200">
                <strong>Stopping Criteria:</strong> Solution score ≥90, or no improvement after 3
                iterations, or executive approval
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


