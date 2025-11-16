'use client';

import { useState } from 'react';

export default function Consigliere() {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const askConsigliere = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAdvice('');

    try {
      const response = await fetch('/api/consigliere/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAdvice(data.advice || 'No advice received');
    } catch (error) {
      setAdvice('Error: Failed to get advice from Consigliere');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold text-white">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Consigliere</h1>
            <p className="text-slate-300">Your strategic advisor. Reports directly to you.</p>
          </div>
        </div>
      </div>

      {/* Question Input */}
      <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
        <label className="mb-2 block text-sm font-semibold text-white">
          Ask The Consigliere
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do we need? What are we missing? What should we do next?"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-4 text-white placeholder-slate-400 focus:border-emerald-300/60 focus:outline-none focus:ring focus:ring-emerald-500/20"
          rows={4}
        />
        <button
          onClick={askConsigliere}
          disabled={loading || !question.trim()}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Consulting Consigliere...' : 'Get Advice'}
        </button>
      </div>

      {/* Quick Questions */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          'What do we need right now?',
          'What are we missing?',
          'What should we build next?',
          'What are the biggest risks?',
        ].map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuestion(q);
              setTimeout(() => askConsigliere(), 100);
            }}
            className="rounded-xl border border-white/10 bg-slate-800/40 p-4 text-left text-sm text-slate-200 transition hover:border-emerald-300/60 hover:bg-slate-800/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Advice Display */}
      {advice && (
        <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h2 className="text-xl font-bold text-white">Consigliere's Advice</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-200">{advice}</div>
          </div>
        </div>
      )}
    </div>
  );
}
