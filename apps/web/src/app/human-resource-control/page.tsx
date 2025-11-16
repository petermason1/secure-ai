"use client";

import { useState } from 'react';

const mockStaff = [
  { id: 'EMP-101', name: 'Sarah Malik', role: 'Product Lead', status: 'Active', allocation: 0.8 },
  { id: 'EMP-214', name: 'Leo Grant', role: 'Senior Dev', status: 'On PTO', allocation: 0.6 },
  { id: 'EMP-305', name: 'Nina Flores', role: 'Recruiter', status: 'Active', allocation: 1.0 },
];

const mockRequests = [
  { id: 'REQ-001', title: 'Staff AI Safety Course', owner: 'L&D', due: '2025-11-20', status: 'pending' },
  { id: 'REQ-002', title: 'Hire UK Accounts Lead', owner: 'Recruitment', due: '2025-11-18', status: 'in_progress' },
];

export default function HumanResourceControlPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      <header className="space-y-2">
        <p className="uppercase tracking-[0.3em] text-xs text-slate-400">Human Resource Control</p>
        <h1 className="text-4xl font-semibold">Minimal Viable Humans Dashboard</h1>
        <p className="text-slate-400 max-w-2xl">
          Track staffing, approvals, and human-only controls. Every action stays behind manual review and can be halted instantly.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">People Inventory</h2>
            <button className="px-3 py-1 text-sm border border-slate-700 rounded-full hover:bg-slate-800">Manual Update</button>
          </div>
          <div className="space-y-4">
            {mockStaff.map((person) => (
              <div
                key={person.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition ${
                  selected === person.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-800 bg-slate-900/60'
                }`}
                onClick={() => setSelected(person.id)}
              >
                <div>
                  <p className="text-lg font-medium">{person.name}</p>
                  <p className="text-sm text-slate-400">{person.role}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full border border-slate-700 text-slate-300">
                    {person.status}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">Allocation {(person.allocation * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Human Approvals</h3>
            <p className="text-sm text-slate-400">Nothing moves without a founder signature.</p>
          </div>
          <div className="space-y-3">
            {mockRequests.map((req) => (
              <div key={req.id} className="border border-slate-800 rounded-xl p-3 text-sm space-y-1 bg-slate-950/30">
                <p className="text-slate-200 font-medium">{req.title}</p>
                <p className="text-slate-400">{req.owner} • Due {req.due}</p>
                <span className="text-xs uppercase tracking-wide text-amber-400">Status: {req.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl bg-cyan-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30">
            Log New Request
          </button>
        </div>
      </section>
    </div>
  );
}
