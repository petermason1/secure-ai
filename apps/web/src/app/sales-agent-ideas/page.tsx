import IdeaStudio from '../components/IdeaStudio';

export default function SalesAgentIdeasPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Sales Automation Ideas
          </h1>
          <p className="mt-2 text-slate-400">
            Generate ideas for improving and expanding the Sales Automation Agent system
          </p>
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-200">
              <strong>Current System:</strong> AI-powered lead scoring, rule-based routing, CRM/Email automation, 
              cost control, and complete audit logging. Use the idea generator below to brainstorm enhancements, 
              new features, integrations, or improvements.
            </p>
          </div>
        </header>
        <IdeaStudio />
      </div>
    </div>
  );
}
