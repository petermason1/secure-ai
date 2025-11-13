'use client';

import { useState } from 'react';

type ValidationResult = {
  syntax_valid: boolean;
  test_queries_passed: boolean;
  performance_score: number;
  issues: string[];
};

type SQLResult = {
  sql: string;
  explanation: string;
  validation: ValidationResult;
  instructions: {
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
  };
  deployed: boolean;
  metadata: {
    model: string;
    tokens: number;
    generated_at: string;
  };
};

export default function SQLGenerator({ context = 'general' }: { context?: string }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SQLResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!description.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/sql-agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          context,
          features: ['multi_tenant', 'audit_logging', 'rls_policies']
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('SQL generation failed:', error);
      alert(`Failed to generate SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!result) return;
    navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getStatusBadge(status: boolean, label: string) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
          status
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
            : 'border-rose-400/30 bg-rose-500/10 text-rose-200'
        }`}
      >
        <span aria-hidden="true">{status ? '✓' : '✕'}</span>
        {label}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">AI SQL Generator</h3>
          <p className="mt-1 text-sm text-slate-400">
            Describe what you need and we'll generate production-ready SQL
          </p>
        </div>
        <div className="text-2xl">🤖</div>
      </div>

      <textarea
        className="mt-4 w-full rounded-lg border border-white/10 bg-slate-800/70 p-3 text-white outline-none transition focus:border-emerald-300/60 focus:ring focus:ring-emerald-500/20"
        rows={3}
        placeholder="e.g., I need a table for storing social media posts with approval workflow and per-client isolation"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={generate}
        disabled={loading || !description.trim()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-950 border-t-transparent" />
            Generating...
          </>
        ) : (
          <>⚡ Generate SQL</>
        )}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          {/* Validation Status */}
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(result.validation.syntax_valid, 'Syntax Valid')}
            {getStatusBadge(result.validation.test_queries_passed, 'Tests Passed')}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-200">
              ⚡ Performance: {result.validation.performance_score}%
            </span>
          </div>

          {/* Issues (if any) */}
          {result.validation.issues.length > 0 && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Suggestions
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-100">
                {result.validation.issues.map((issue, i) => (
                  <li key={i}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SQL Output */}
          <div className="rounded-lg border border-white/10 bg-slate-800/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Generated SQL
              </span>
              <button
                onClick={copyToClipboard}
                className="text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="max-h-96 overflow-auto text-xs text-slate-200">
              <code>{result.sql}</code>
            </pre>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
            <h4 className="text-sm font-semibold text-white">How to Deploy</h4>
            <ol className="mt-2 space-y-1 text-sm text-slate-300">
              <li>1. {result.instructions.step_1}</li>
              <li>2. {result.instructions.step_2}</li>
              <li>3. {result.instructions.step_3}</li>
              <li>4. {result.instructions.step_4}</li>
            </ol>
          </div>

          {/* Explanation */}
          <details className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              What does this SQL do?
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {result.explanation}
            </p>
          </details>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Model: {result.metadata.model}</span>
            <span>•</span>
            <span>Tokens: {result.metadata.tokens}</span>
            <span>•</span>
            <span>Generated: {new Date(result.metadata.generated_at).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
