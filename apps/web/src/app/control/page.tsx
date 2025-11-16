"use client";
import { useEffect, useState } from "react";

type Action = "intake" | "approve" | "kill";
const ENDPOINTS: Record<Action, string> = {
  intake: "/api/control/intake",
  approve: "/api/control/approve",
  kill: "/api/control/kill",
};

export default function ControlPanel() {
  const [pending, setPending] = useState<Action | null>(null);
  const [status, setStatus] = useState("Idle");
  const [botStatus, setBotStatus] = useState<{ requests: any[]; assignments: any[] } | null>(null);
  const [botLoading, setBotLoading] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [departments, setDepartments] = useState<string[]>(["media-team"]);

  async function trigger(action: Action) {
    if (!confirm(`Proceed with ${action}?`)) return;

    setPending(action);
    setStatus("Sending...");

    const controller = new AbortController();
    window.manualStop = () => {
      controller.abort();
      setPending(null);
      setStatus("Request manually halted.");
      delete window.manualStop;
    };

    try {
      const res = await fetch(ENDPOINTS[action], {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Trustee": "founder" },
        body: JSON.stringify({ requestedBy: "founder" }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json();
      setStatus(`Success: ${payload.message}`);
    } catch (err: any) {
      setStatus(`Error: ${err?.message ?? "Unknown"}`);
    } finally {
      setPending(null);
      delete window.manualStop;
    }
  }

  async function createRequest() {
    if (!requestTitle.trim()) {
      setStatus("Provide a title first.");
      return;
    }
    setStatus("Registering request...");
    try {
      const res = await fetch("/api/project-manager/bot/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: requestTitle.trim(),
          description: requestDesc.trim(),
          flags: ["flag-security", "flag-legal"],
          departments,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRequestTitle("");
      setRequestDesc("");
      setStatus("Request logged.");
      loadBotStatus();
    } catch (error: any) {
      setStatus(`Error: ${error?.message ?? "Failed to create request"}`);
    }
  }

  async function loadBotStatus() {
    try {
      setBotLoading(true);
      const res = await fetch("/api/project-manager/bot/status");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBotStatus(data);
    } catch (error: any) {
      console.error(error);
      setBotStatus(null);
    } finally {
      setBotLoading(false);
    }
  }

  useEffect(() => {
    loadBotStatus();
  }, []);

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold">Manual Control Suite</h1>
      <p className="text-sm text-slate-400">
        No automation. Every action requires confirmation and can be stopped instantly.
      </p>

      <div className="space-y-4 rounded-xl border border-slate-700 p-4">
        <button
          disabled={!!pending}
          onClick={() => trigger("intake")}
          className="w-full rounded bg-blue-600 px-4 py-2 font-semibold disabled:opacity-50"
        >
          Intake Request
        </button>
        <button
          disabled={!!pending}
          onClick={() => trigger("approve")}
          className="w-full rounded bg-emerald-600 px-4 py-2 font-semibold disabled:opacity-50"
        >
          Approve Request
        </button>
        <button
          disabled={!!pending}
          onClick={() => trigger("kill")}
          className="w-full rounded bg-red-600 px-4 py-2 font-semibold disabled:opacity-50"
        >
          Kill Switch
        </button>
        <button
          disabled={!pending}
          onClick={() => window.manualStop?.()}
          className="w-full rounded border border-yellow-400 px-4 py-2 font-semibold text-yellow-300 disabled:opacity-30"
        >
          Stop Current Request
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 p-3 text-sm">
        <strong>Status:</strong> {status}
      </div>

      <section className="space-y-3 rounded-xl border border-slate-700 p-4">
        <h2 className="text-xl font-semibold">Log New Request</h2>
        <input
          value={requestTitle}
          onChange={(e) => setRequestTitle(e.target.value)}
          placeholder="Request title"
          className="w-full rounded border border-slate-600 bg-slate-900 p-2"
        />
        <textarea
          value={requestDesc}
          onChange={(e) => setRequestDesc(e.target.value)}
          placeholder="Description"
          className="w-full rounded border border-slate-600 bg-slate-900 p-2"
        />
        <div className="flex gap-2 text-sm text-slate-400">
          <label>
            <input
              type="checkbox"
              checked={departments.includes("media-team")}
              onChange={(e) =>
                setDepartments((prev) =>
                  e.target.checked ? [...prev, "media-team"] : prev.filter((d) => d !== "media-team")
                )
              }
            />{" "}
            Media Team
          </label>
          <label>
            <input
              type="checkbox"
              checked={departments.includes("trend-intelligence")}
              onChange={(e) =>
                setDepartments((prev) =>
                  e.target.checked
                    ? [...prev, "trend-intelligence"]
                    : prev.filter((d) => d !== "trend-intelligence")
                )
              }
            />{" "}
            Trend Intel
          </label>
          <label>
            <input
              type="checkbox"
              checked={departments.includes("legal-department")}
              onChange={(e) =>
                setDepartments((prev) =>
                  e.target.checked ? [...prev, "legal-department"] : prev.filter((d) => d !== "legal-department")
                )
              }
            />{" "}
            Legal
          </label>
        </div>
        <button onClick={createRequest} className="rounded bg-slate-200 px-4 py-2 font-semibold text-slate-900">
          Register Request
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Project Manager Bot</h2>
          <button
            onClick={loadBotStatus}
            disabled={botLoading}
            className="rounded border border-slate-500 px-3 py-1 text-sm disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        {botStatus ? (
          <div className="space-y-2 text-sm text-slate-300">
            {botStatus.requests.length === 0 && <p>No requests logged yet.</p>}
            {botStatus.requests.map((req) => {
              const related = botStatus.assignments.filter((a) => a.request_id === req.id);
              const pendingCount = related.filter((a) => a.status === "pending").length;
              return (
                <div key={req.id} className="rounded border border-slate-600 p-3">
                  <div className="font-semibold">{req.title}</div>
                  <div className="text-xs text-slate-400">
                    Status: {req.status} • Pending assignments: {pendingCount}/{related.length}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            {botLoading ? "Loading status..." : "Bot status unavailable."}
          </p>
        )}
      </section>
    </main>
  );
}

declare global {
  interface Window {
    manualStop?: () => void;
  }
}
