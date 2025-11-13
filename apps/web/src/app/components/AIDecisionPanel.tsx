'use client';

import { useState, useEffect } from 'react';

type Decision = {
  id: string;
  question: string;
  context?: string;
  action_if_yes: string;
  action_if_no?: string;
  priority: 'high' | 'medium' | 'low';
  expires_at?: string;
};

export default function AIDecisionPanel() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Poll for new decisions
  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchDecisions() {
    try {
      const res = await fetch('/api/ai-decision/pending');
      if (res.ok) {
        const data = await res.json();
        if (data.decisions && data.decisions.length > 0) {
          setDecisions(data.decisions);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    }
  }

  async function handleDecision(answer: 'yes' | 'no' | 'defer') {
    if (!currentDecision) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai-decision/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_id: currentDecision.id,
          answer
        })
      });

      if (res.ok) {
        // Move to next decision
        if (currentIndex < decisions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // No more decisions
          setIsVisible(false);
          setDecisions([]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to respond to decision:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  const currentDecision = decisions[currentIndex];

  if (!isVisible || !currentDecision) {
    return null;
  }

  const priorityColors = {
    high: 'border-rose-400/30 bg-rose-500/10',
    medium: 'border-amber-400/30 bg-amber-500/10',
    low: 'border-sky-400/30 bg-sky-500/10'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 animate-in slide-in-from-bottom-4">
      <div className={`rounded-xl border ${priorityColors[currentDecision.priority]} bg-slate-900 p-6 shadow-2xl backdrop-blur`}>
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">AI Assistant</p>
              {decisions.length > 1 && (
                <span className="text-xs text-slate-500">
                  {currentIndex + 1} of {decisions.length}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {currentDecision.question}
            </p>
            {currentDecision.context && (
              <p className="mt-2 text-xs text-slate-400">
                {currentDecision.context}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-slate-400"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleDecision('yes')}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 active:translate-y-px disabled:opacity-50"
          >
            {isProcessing ? '...' : 'Yes'}
          </button>
          <button
            onClick={() => handleDecision('no')}
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-white/10 px-4 py-3 font-semibold text-white transition hover:border-white/20 disabled:opacity-50"
          >
            No
          </button>
        </div>

        {/* Defer */}
        <button
          onClick={() => handleDecision('defer')}
          disabled={isProcessing}
          className="mt-2 w-full text-xs text-slate-500 transition hover:text-slate-400 disabled:opacity-50"
        >
          Not now
        </button>

        {/* Progress */}
        {decisions.length > 1 && (
          <div className="mt-4 flex gap-1">
            {decisions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < currentIndex
                    ? 'bg-emerald-500'
                    : i === currentIndex
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
