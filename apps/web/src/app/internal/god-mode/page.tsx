'use client';

import { useState } from 'react';

type DeepAnalysis = {
  confidenceScore: number;
  marketIntel: {
    tam: string;
    sam: string;
    som: string;
    growth: string;
    trends: string[];
  };
  competition: {
    direct: string[];
    indirect: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  demand: {
    searchVolume: string;
    socialMentions: string;
    vcFunding: string;
    sentiment: string;
  };
  monetization: {
    models: string[];
    pricing: string;
    ltv: string;
    cac: string;
  };
  risks: Array<{ risk: string; severity: string; mitigation: string }>;
  opportunities: Array<{ opportunity: string; impact: string; timeline: string }>;
  pivots: Array<{ pivot: string; reasoning: string; revenue: string }>;
  valuation: {
    seed: string;
    seriesA: string;
    seriesB: string;
    exit: string;
  };
  execution: {
    mvp: string;
    beta: string;
    launch: string;
    pmf: string;
  };
};

export default function GodModeGenerator() {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function deepAnalyze() {
    if (!input) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock deep analysis (in production: extended OpenAI call + real data APIs)
    setAnalysis({
      confidenceScore: 87,
      marketIntel: {
        tam: '£500M',
        sam: '£50M',
        som: '£5M',
        growth: '↑ 200% YoY',
        trends: [
          'AI adoption accelerating in SMB market',
          'No-code/low-code demand rising',
          'Remote work driving SaaS spend',
          'Vertical-specific solutions outperforming horizontal'
        ]
      },
      competition: {
        direct: ['Competitor A (£10M ARR, weak UX)', 'Competitor B (£5M ARR, expensive)'],
        indirect: ['ChatGPT (general purpose)', 'Consultants (slow, expensive)'],
        weaknesses: ['Poor mobile experience', 'No API', 'Limited integrations', 'High churn'],
        opportunities: ['First-mover in vertical', 'Better pricing', 'Superior UX', 'API-first']
      },
      demand: {
        searchVolume: '50k/mo (↑ 200% YoY)',
        socialMentions: '1k/mo on Reddit, 5k/mo on Twitter',
        vcFunding: '£100M+ invested in space (last 12 months)',
        sentiment: '85% positive, 10% neutral, 5% negative'
      },
      monetization: {
        models: ['SaaS subscription', 'Usage-based', 'Enterprise licensing', 'API access'],
        pricing: '£50-500/mo (SMB), £5k-100k/year (Enterprise)',
        ltv: '£6k (SMB), £500k (Enterprise)',
        cac: '£500 (organic), £2k (paid)'
      },
      risks: [
        { risk: 'Market timing too early', severity: 'Medium', mitigation: 'Focus on early adopters first' },
        { risk: 'AI regulation (EU)', severity: 'Low', mitigation: 'Build compliance from day 1' },
        { risk: 'Well-funded competitor enters', severity: 'High', mitigation: 'Move fast, lock in customers' },
        { risk: 'High LLM costs at scale', severity: 'Medium', mitigation: 'Optimize prompts, cache aggressively' }
      ],
      opportunities: [
        { opportunity: 'First-mover in vertical', impact: '18-month lead', timeline: '3 months to launch' },
        { opportunity: 'Partnership with Supabase', impact: 'Distribution channel', timeline: '6 months' },
        { opportunity: 'White-label product', impact: '10x revenue potential', timeline: '12 months' },
        { opportunity: 'Adjacent market expansion', impact: '3x TAM', timeline: '18 months' }
      ],
      pivots: [
        { pivot: 'B2B SaaS for agencies', reasoning: 'Higher ACV, lower churn', revenue: '£200k ARR per customer' },
        { pivot: 'API-first product', reasoning: 'Usage-based pricing, higher margins', revenue: '£1M ARR (1000 devs × £1k)' },
        { pivot: 'Vertical-specific (legal tech)', reasoning: 'Premium pricing, less competition', revenue: '£500k ARR (50 firms × £10k)' },
        { pivot: 'Open-source + paid enterprise', reasoning: 'Community-led growth', revenue: '£5M ARR (500 enterprise × £10k)' }
      ],
      valuation: {
        seed: '£5M (pre-revenue, strong team + traction)',
        seriesA: '£50M (£500k ARR, 10x multiple)',
        seriesB: '£500M (£5M ARR, 100x multiple for hypergrowth)',
        exit: '£1B+ (IPO or acquisition at £50M+ ARR)'
      },
      execution: {
        mvp: '4 weeks (core features only)',
        beta: '8 weeks (10 beta customers)',
        launch: '12 weeks (Product Hunt, HN, social)',
        pmf: '24 weeks (£100k ARR, <5% churn)'
      }
    });
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl border border-rose-400/30 bg-rose-500/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-3xl font-bold text-rose-200">GOD MODE IDEA GENERATOR</h1>
          </div>
          <p className="text-slate-300">Deep market intelligence. Competitive analysis. Risk modeling. Valuation projections.</p>
          <p className="text-xs text-rose-300 mt-2">🔒 Internal only. Not accessible to public.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter idea, competitor URL, market trend, or problem..."
            className="w-full h-32 rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
          />
          <button
            onClick={deepAnalyze}
            disabled={!input || loading}
            className="mt-4 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : '⚡ Deep Analysis'}
          </button>
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-emerald-200">Confidence Score</h2>
                <span className="text-5xl font-bold text-emerald-400">{analysis.confidenceScore}%</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">📊 Market Intelligence</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>TAM:</strong> {analysis.marketIntel.tam}</p>
                  <p><strong>SAM:</strong> {analysis.marketIntel.sam}</p>
                  <p><strong>SOM:</strong> {analysis.marketIntel.som}</p>
                  <p><strong>Growth:</strong> {analysis.marketIntel.growth}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">💰 Monetization</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Pricing:</strong> {analysis.monetization.pricing}</p>
                  <p><strong>LTV:</strong> {analysis.monetization.ltv}</p>
                  <p><strong>CAC:</strong> {analysis.monetization.cac}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-6">
              <h3 className="text-lg font-semibold text-rose-200 mb-4">⚠️ Risks</h3>
              <div className="space-y-3">
                {analysis.risks.map((r, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-semibold text-white text-sm">{r.risk}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        r.severity === 'High' ? 'bg-rose-500/20 text-rose-300' :
                        r.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>{r.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400">Mitigation: {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <h3 className="text-lg font-semibold text-emerald-200 mb-4">🚀 Opportunities</h3>
              <div className="space-y-3">
                {analysis.opportunities.map((o, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <p className="font-semibold text-white text-sm mb-1">{o.opportunity}</p>
                    <p className="text-xs text-slate-400">Impact: {o.impact} • Timeline: {o.timeline}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Strategic Pivots</h3>
              <div className="space-y-3">
                {analysis.pivots.map((p, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                    <p className="font-semibold text-white mb-2">{p.pivot}</p>
                    <p className="text-sm text-slate-300 mb-2">{p.reasoning}</p>
                    <p className="text-xs text-emerald-300">Revenue potential: {p.revenue}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
              <h3 className="text-lg font-semibold text-yellow-200 mb-4">📈 Valuation Path</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Seed</p>
                  <p className="text-lg font-bold text-white">{analysis.valuation.seed}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Series A</p>
                  <p className="text-lg font-bold text-white">{analysis.valuation.seriesA}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Series B</p>
                  <p className="text-lg font-bold text-white">{analysis.valuation.seriesB}</p>
                </div>
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <p className="text-xs text-emerald-300 mb-1">Exit</p>
                  <p className="text-lg font-bold text-emerald-200">{analysis.valuation.exit}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
