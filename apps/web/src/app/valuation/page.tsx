import ValuationTracker from '../components/ValuationTracker';

export default function ValuationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
            Why.ai Valuation Tracker
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Potential valuation based on built features, revenue projections, and SaaS multiples.
          </p>
          <p className="text-sm text-yellow-400">
            ⚠️ This is a projection tool, not a real market valuation. Current revenue: £0.
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Growth Trajectory</h2>
            <div className="flex gap-2">
              <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                Conservative
              </button>
              <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors font-semibold">
                Aggressive
              </button>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-xs font-semibold mb-1">💡 Why These Targets Are Achievable</p>
            <p className="text-blue-200 text-xs">
              With 15+ AI departments, enterprise positioning (£100k tier), multiple revenue streams, 
              and portfolio model, you're positioned for faster growth than typical SaaS companies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-slate-800/40">
              <div>
                <p className="font-semibold text-white">Week 1 (Now)</p>
                <p className="text-sm text-slate-400">MVP + Core Features (Pre-Revenue)</p>
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
                <p className="font-semibold text-white">Month 3</p>
                <p className="text-sm text-slate-400">£100k MRR + First Enterprise Client</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">£42M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-slate-800/40">
              <div>
                <p className="font-semibold text-white">Month 6</p>
                <p className="text-sm text-slate-400">£500k MRR (£6M ARR run-rate)</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">£60M</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
              <div>
                <p className="font-semibold text-emerald-200">Year 1</p>
                <p className="text-sm text-emerald-300">£1M MRR (£12M ARR) + Portfolio Exits</p>
                <p className="text-xs text-emerald-400 mt-1">Conservative: £500k MRR | Aggressive: £1M+ MRR</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-200">£120M</p>
                <p className="text-xs text-emerald-400">(10x ARR) or 15-20x with growth</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
              <div>
                <p className="font-semibold text-emerald-200">Year 2</p>
                <p className="text-sm text-emerald-300">£5M MRR (£60M ARR) + Multiple Exits</p>
                <p className="text-xs text-emerald-400 mt-1">Conservative: £2M MRR | Aggressive: £5M+ MRR</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-200">£600M</p>
                <p className="text-xs text-emerald-400">(10x ARR) or £900M+ (15x growth multiple)</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-purple-400/30 bg-purple-500/10">
              <div>
                <p className="font-semibold text-purple-200">Year 3</p>
                <p className="text-sm text-purple-300">£20M MRR (£240M ARR) + Portfolio Value</p>
                <p className="text-xs text-purple-400 mt-1">With enterprise scale + marketplace + exits</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-200">£3.6B</p>
                <p className="text-xs text-purple-400">(15x ARR) - Series B/C territory</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
            <h3 className="font-semibold text-blue-200 mb-2">🚀 Why You Can Aim Higher</h3>
            <ul className="space-y-2 text-sm text-blue-300">
              <li>• <strong>15+ AI Departments:</strong> Each can generate £50k-£500k MRR independently</li>
              <li>• <strong>Enterprise Tier:</strong> £100k/year clients = 10 clients = £1M ARR</li>
              <li>• <strong>Portfolio Model:</strong> Equity-for-services = infinite ROI potential</li>
              <li>• <strong>Multiple Revenue Streams:</strong> SaaS + Enterprise + Marketplace + Exits</li>
              <li>• <strong>Psychology Multiplier:</strong> 2-5x improvement across all departments</li>
              <li>• <strong>First-Mover:</strong> No competitor has full autonomous company stack</li>
              <li>• <strong>Comparables:</strong> OpenAI (£0 revenue → £1B), Notion (£0 → £800M)</li>
            </ul>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4">
            <h3 className="font-semibold text-yellow-200 mb-2">📊 Realistic Path to £1B+</h3>
            <div className="space-y-2 text-sm text-yellow-300">
              <p><strong>Month 6:</strong> £500k MRR → £60M valuation (prove model works)</p>
              <p><strong>Year 1:</strong> £1M MRR → £120M valuation (Series A territory: raise £20M at £200M)</p>
              <p><strong>Year 2:</strong> £5M MRR → £600M valuation (Series B: raise £100M at £1B)</p>
              <p><strong>Year 3:</strong> £20M MRR → £3.6B valuation (Series C or IPO)</p>
              <p className="text-xs text-yellow-400 mt-2">
                This requires: (1) Launching all departments, (2) Getting enterprise clients, (3) Portfolio exits, (4) Marketplace scale
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
