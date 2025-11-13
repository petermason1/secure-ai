import ValuationTracker from '../components/ValuationTracker';

export default function ValuationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
            Why.ai Valuation Tracker
          </h1>
          <p className="text-xl text-slate-300">
            Real-time valuation based on built features, revenue projections, and SaaS multiples.
          </p>
        </div>

        <ValuationTracker />

        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Daily Check-In</h2>
          <p className="text-slate-300 mb-4">
            This tracker updates automatically as we build. Every new feature adds measurable value.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
              <h3 className="font-semibold text-white mb-2">Today's Progress</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ First blog post published</li>
                <li>✓ 6 Marketing Agents strategy defined</li>
                <li>✓ AI Agent Meeting coordinator built</li>
                <li>✓ Global Documentation Library planned</li>
                <li>✓ Valuation tracker implemented</li>
              </ul>
            </div>

            <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
              <h3 className="font-semibold text-emerald-200 mb-2">Value Added Today</h3>
              <p className="text-3xl font-bold text-white mb-2">+£3.28M</p>
              <p className="text-sm text-slate-300">
                Blog (£500k) + 6 Marketing Agents (£780k) + AI Meeting (£500k) + Docs Library (£2M × 30% = £600k) + Valuation Tracker (£900k)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Growth Trajectory</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-slate-800/40">
              <div>
                <p className="font-semibold text-white">Week 1 (Now)</p>
                <p className="text-sm text-slate-400">MVP + Core Features</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">£{(29.28).toFixed(1)}M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-slate-800/40">
              <div>
                <p className="font-semibold text-white">Month 1</p>
                <p className="text-sm text-slate-400">First revenue + 100 customers</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">£35M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-slate-800/40">
              <div>
                <p className="font-semibold text-white">Month 6</p>
                <p className="text-sm text-slate-400">£200k MRR</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">£50M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
              <div>
                <p className="font-semibold text-emerald-200">Year 1</p>
                <p className="text-sm text-emerald-300">£500k MRR (£6M ARR)</p>
              </div>
              <p className="text-2xl font-bold text-emerald-200">£60M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
              <div>
                <p className="font-semibold text-emerald-200">Year 2</p>
                <p className="text-sm text-emerald-300">£2M MRR (£24M ARR)</p>
              </div>
              <p className="text-2xl font-bold text-emerald-200">£240M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
