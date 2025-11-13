export default function ExplainExecute() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-bold">AI Workflow Automation — In Weeks, Not Months</h1>
          <p className="mt-2 text-slate-300">Automate loan triage, claims intake, and RFP processing with auditable AI agents.</p>
          <ul className="mt-4 space-y-2 text-slate-200">
            <li>• 4–6 week deployment</li>
            <li>• Compliance‑first audit logging</li>
            <li>• Connectors: Salesforce, ServiceNow, Email</li>
            <li>• “Bring your own LLM” ready</li>
          </ul>
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            <strong>ROI snapshot:</strong> Replace 60–80% of manual steps • Payback in 3–6 months
          </div>
        </section>
        <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Start a Guided Demo</h2>
          <form className="mt-4 space-y-4">
            <input className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2" placeholder="Your name" />
            <input className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2" placeholder="Company" />
            <select className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2">
              <option>Choose a workflow</option>
              <option>Loan triage</option>
              <option>Claims intake</option>
              <option>RFP processing</option>
            </select>
            <button type="button" className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-400">
              Book a Tier‑3 Demo
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">We’ll send a short, tailored walkthrough within 24 hours.</p>
        </section>
      </div>
    </div>
  );
}
