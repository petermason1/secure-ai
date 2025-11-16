"use client";

import { useState } from 'react';

const mockRequests = [
  { id: 'PAY-101', title: 'Set up Apple Pay + Google Pay bundle', owner: 'Payments Ops', status: 'pending', risk: 'medium' },
  { id: 'PAY-204', title: 'Stripe price automation review', owner: 'Finance', status: 'in_progress', risk: 'low' },
];

const mockSignals = [
  { id: 'SIG-01', label: 'Settlement Lag', value: '+18 hrs', trend: 'risk' },
  { id: 'SIG-02', label: 'Chargeback Rate', value: '0.12%', trend: 'ok' },
  { id: 'SIG-03', label: 'Token Spend', value: '£4,200/day', trend: 'watch' },
];

export default function PaymentsTeamPage() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      <header className="space-y-2">
        <p className="uppercase tracking-[0.3em] text-xs text-slate-400">Payments Control</p>
        <h1 className="text-4xl font-semibold">Payments Squad Skeleton</h1>
        <p className="text-slate-400 max-w-2xl">
          Minimal surface for tracking requests, risk signals, and manual approvals across the payment stack.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Requests Queue</h2>
            <button className="px-3 py-1 text-sm border border-slate-700 rounded-full hover:bg-slate-800">
              Log Manual Decision
            </button>
          </div>
          {mockRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                selectedRequest === req.id
                  ? 'border-emerald-400 bg-emerald-400/5'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
              onClick={() => setSelectedRequest(req.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{req.title}</p>
                  <p className="text-sm text-slate-400">Owner: {req.owner}</p>
                </div>
                <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full border border-slate-700">
                  {req.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Risk: {req.risk}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Signals</h3>
            <p className="text-sm text-slate-400">Watch the indicators that trigger founder review.</p>
          </div>
          <div className="space-y-3">
            {mockSignals.map((sig) => (
              <div key={sig.id} className="border border-slate-800 rounded-xl p-3 text-sm space-y-1 bg-slate-950/30">
                <div className="flex items-center justify-between">
                  <p className="text-slate-200 font-medium">{sig.label}</p>
                  <span
                    className={`text-xs uppercase tracking-wide ${
                      sig.trend === 'risk'
                        ? 'text-rose-400'
                        : sig.trend === 'watch'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {sig.trend}
                  </span>
                </div>
                <p className="text-slate-400">{sig.value}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/30">
            Trigger Settlement Sweep
          </button>
        </div>
      </section>
    </div>
  );
}
