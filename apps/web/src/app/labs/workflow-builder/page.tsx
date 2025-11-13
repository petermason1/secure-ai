'use client';

import { useState } from 'react';

type Node = { id: string; x: number; y: number; label: string };
type Edge = { id: string; from: string; to: string };

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'start', x: 80, y: 120, label: 'Start' },
    { id: 'crm', x: 360, y: 120, label: 'CRM' },
    { id: 'email', x: 640, y: 120, label: 'Email' },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1', from: 'start', to: 'crm' },
    { id: 'e2', from: 'crm', to: 'email' },
  ]);
  const [selected, setSelected] = useState<string | null>(null);

  function onDrag(idx: number, e: React.MouseEvent) {
    const startX = e.clientX, startY = e.clientY;
    const start = { ...nodes[idx] };
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      const next = [...nodes];
      next[idx] = { ...start, x: start.x + dx, y: start.y + dy };
      setNodes(next);
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function addNode() {
    const id = `n${Date.now().toString(36)}`;
    setNodes([...nodes, { id, x: 120, y: 260, label: 'Step' }]);
  }
  function connect(a: string, b: string) {
    setEdges([...edges, { id: `e${Date.now()}`, from: a, to: b }]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 relative overflow-hidden">
          <svg className="absolute inset-0 -z-10 opacity-20" width="100%" height="100%">
            {edges.map((e) => {
              const from = nodes.find((n) => n.id === e.from)!;
              const to = nodes.find((n) => n.id === e.to)!;
              return (
                <line
                  key={e.id}
                  x1={from.x + 80}
                  y1={from.y + 30}
                  x2={to.x + 80}
                  y2={to.y + 30}
                  stroke="#34d399"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          {nodes.map((n, idx) => (
            <div
              key={n.id}
              className={`absolute w-40 cursor-move rounded-xl border p-3 select-none ${
                selected === n.id
                  ? 'border-emerald-400 bg-slate-800'
                  : 'border-white/10 bg-slate-800/70'
              }`}
              style={{ left: n.x, top: n.y }}
              onMouseDown={(e) => {
                setSelected(n.id);
                onDrag(idx, e);
              }}
            >
              <input
                value={n.label}
                onChange={(e) => {
                  const next = [...nodes];
                  next[idx] = { ...n, label: e.target.value };
                  setNodes(next);
                }}
                className="w-full bg-transparent outline-none text-sm font-semibold"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => connect(n.id, 'crm')}
                  className="text-xs rounded-full border border-white/10 px-2 py-0.5 hover:border-emerald-400/50"
                >
                  Link→CRM
                </button>
                <button
                  onClick={() => setNodes(nodes.filter((x) => x.id !== n.id))}
                  className="text-xs rounded-full border border-white/10 px-2 py-0.5 hover:border-rose-400/50"
                >
                  Delete
                </button>
              </div>
              <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          ))}
        </div>
        <aside className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Workflow Builder</h2>
          <button
            onClick={addNode}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            Add Node
          </button>
          <div className="text-sm text-slate-300">
            <p className="mb-2">
              Selected: <span className="font-semibold">{selected ?? 'None'}</span>
            </p>
            <details className="rounded-lg border border-white/10 p-2">
              <summary className="cursor-pointer text-slate-200 font-semibold">
                Export JSON
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto text-xs">{JSON.stringify({ nodes, edges }, null, 2)}</pre>
            </details>
          </div>
        </aside>
      </div>
    </div>
  );
}
