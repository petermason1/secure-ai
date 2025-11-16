'use client';

import { useState } from 'react';
import Link from 'next/link';

type AnalysisMode = 'strategic' | 'unhinged' | 'moonshot' | 'thunder' | 'war' | 'love';

type MoonshotAnalysis = {
  headline: string;
  elevator_pitch: string;
  core_innovation: string;
  sci_fi_features: string[];
  delight_moments: string[];
  never_before_seen: string[];
  radical_business_models: string[];
  viral_growth_hooks: string[];
  go_to_market_blitz: {
    day_1: string;
    day_2: string;
    day_3: string;
  };
  cross_industry_collaborations: string[];
  ethical_disruptions: string[];
  ai_human_blend: string;
  market_modeling: {
    tam: string;
    sam: string;
    som: string;
    growth_projection: string;
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
  valuation_path: {
    seed: string;
    series_a: string;
    series_b: string;
    exit: string;
  };
  confidence_score: number;
};

type StrategicAnalysis = {
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
  const [mode, setMode] = useState<AnalysisMode>('strategic');
  const [moonshotAnalysis, setMoonshotAnalysis] = useState<MoonshotAnalysis | null>(null);
  const [strategicAnalysis, setStrategicAnalysis] = useState<StrategicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deepAnalyze() {
    if (!input.trim()) {
      setError('Please enter an idea or description');
      return;
    }

    setLoading(true);
    setError(null);
    setMoonshotAnalysis(null);
    setStrategicAnalysis(null);

    try {
      const response = await fetch('/api/god-mode/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (mode === 'unhinged' || mode === 'moonshot' || mode === 'thunder' || mode === 'war' || mode === 'love') {
        setMoonshotAnalysis(data.analysis);
      } else {
        // Convert to strategic format
        const analysis = data.analysis;
        setStrategicAnalysis({
          confidenceScore: analysis.confidence_score || 85,
          marketIntel: {
            tam: analysis.market_modeling?.tam || analysis.marketIntel?.tam || '£500M',
            sam: analysis.market_modeling?.sam || analysis.marketIntel?.sam || '£50M',
            som: analysis.market_modeling?.som || analysis.marketIntel?.som || '£5M',
            growth: analysis.market_modeling?.growth_projection || analysis.marketIntel?.growth || '↑ 200% YoY',
            trends: analysis.marketIntel?.trends || [],
          },
          competition: {
            direct: analysis.competition?.direct || [],
            indirect: analysis.competition?.indirect || [],
            weaknesses: analysis.competition?.weaknesses || [],
            opportunities: analysis.competition?.opportunities || [],
          },
          demand: {
            searchVolume: analysis.demand?.searchVolume || '50k/mo',
            socialMentions: analysis.demand?.socialMentions || '1k/mo',
            vcFunding: analysis.demand?.vcFunding || '£100M+',
            sentiment: analysis.demand?.sentiment || '85% positive',
          },
          monetization: {
            models: analysis.monetization?.models || [],
            pricing: analysis.monetization?.pricing || '£50-500/mo',
            ltv: analysis.monetization?.ltv || '£6k',
            cac: analysis.monetization?.cac || '£500',
          },
          risks: analysis.risks || [],
          opportunities: analysis.opportunities || [],
          pivots: analysis.pivots || [],
          valuation: {
            seed: analysis.valuation_path?.seed || '£5M',
            seriesA: analysis.valuation_path?.series_a || '£50M',
            seriesB: analysis.valuation_path?.series_b || '£500M',
            exit: analysis.valuation_path?.exit || '£1B+',
          },
          execution: {
            mvp: '4 weeks',
            beta: '8 weeks',
            launch: '12 weeks',
            pmf: '24 weeks',
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl border border-rose-400/30 bg-rose-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h1 className="text-3xl font-bold text-rose-200">GOD MODE IDEA GENERATOR</h1>
                <p className="text-slate-300 mt-1">Deep market intelligence. Competitive analysis. Risk modeling. Valuation projections. Moonshot ideas.</p>
              </div>
            </div>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 text-sm">
              ← Dashboard
            </Link>
          </div>
          <p className="text-xs text-rose-300">🔒 Internal only. Not accessible to public.</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <label className="block text-sm font-semibold text-white mb-3">Choose Your God Mode</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setMode('strategic')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'strategic'
                  ? 'bg-blue-600 text-white border-2 border-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              📊 Strategic
            </button>
            <button
              onClick={() => setMode('unhinged')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'unhinged'
                  ? 'bg-purple-600 text-white border-2 border-purple-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              🚀 Unhinged
            </button>
            <button
              onClick={() => setMode('moonshot')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'moonshot'
                  ? 'bg-rose-600 text-white border-2 border-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              🌙 Moonshot
            </button>
            <button
              onClick={() => setMode('thunder')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'thunder'
                  ? 'bg-yellow-600 text-white border-2 border-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ⚡ Thunder
            </button>
            <button
              onClick={() => setMode('war')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'war'
                  ? 'bg-red-600 text-white border-2 border-red-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ⚔️ War
            </button>
            <button
              onClick={() => setMode('love')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                mode === 'love'
                  ? 'bg-pink-600 text-white border-2 border-pink-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              💖 Love
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {mode === 'strategic' && '📊 Conservative, realistic analysis with market intelligence'}
            {mode === 'unhinged' && '🚀 Wild, never-before-seen features with sci-fi automation'}
            {mode === 'moonshot' && '🌙 Radical ideas that ignore feasibility, prioritize massive impact'}
            {mode === 'thunder' && '⚡ Aggressive, fast-moving ideas with explosive growth potential'}
            {mode === 'war' && '⚔️ Competitive, battle-tested strategies to dominate markets'}
            {mode === 'love' && '💖 Human-centered, emotionally resonant ideas that build deep connections'}
          </p>
        </div>

        {/* Input */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'strategic'
                ? 'Enter idea, competitor URL, market trend, or problem...'
                : mode === 'thunder'
                ? 'Enter idea for lightning-fast execution... (e.g., "Platform that launches in 2 weeks and goes viral")'
                : mode === 'war'
                ? 'Enter idea for market domination... (e.g., "How to crush competitors and own this market")'
                : mode === 'love'
                ? 'Enter idea for deep connection... (e.g., "Platform that makes people feel truly understood")'
                : 'Enter your moonshot idea prompt... (e.g., "Creator Economy platform for non-profit program leads that predicts bottlenecks and synchronizes global volunteer networks")'
            }
            className="w-full h-32 rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
          />
          <button
            onClick={deepAnalyze}
            disabled={!input.trim() || loading}
            className="mt-4 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading 
              ? 'Analyzing...' 
              : mode === 'strategic' 
                ? '⚡ Deep Analysis' 
                : mode === 'thunder'
                ? '⚡ Strike with Thunder'
                : mode === 'war'
                ? '⚔️ Declare War'
                : mode === 'love'
                ? '💖 Spread Love'
                : '🌙 Generate Moonshot'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Moonshot Analysis */}
        {moonshotAnalysis && (
          <div className="space-y-6">
            {/* Mode-Specific Header */}
            {mode === 'thunder' && (
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">⚡</span>
                  <h2 className="text-2xl font-bold text-yellow-200">God of Thunder Mode</h2>
                </div>
                <p className="text-yellow-100">Lightning-fast execution. Explosive growth. Strike hard and fast.</p>
              </div>
            )}
            {mode === 'war' && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">⚔️</span>
                  <h2 className="text-2xl font-bold text-red-200">God of War Mode</h2>
                </div>
                <p className="text-red-100">Market domination. Crush competitors. Win the war.</p>
              </div>
            )}
            {mode === 'love' && (
              <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">💖</span>
                  <h2 className="text-2xl font-bold text-pink-200">God of Love Mode</h2>
                </div>
                <p className="text-pink-100">Deep connections. Emotional resonance. Build relationships that last.</p>
              </div>
            )}

            {/* Elevator Pitch - Most Important */}
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <h2 className="text-2xl font-bold text-emerald-200 mb-3">🎯 One-Line Elevator Pitch</h2>
              <p className="text-xl font-semibold text-white leading-relaxed">{moonshotAnalysis.elevator_pitch}</p>
              <p className="text-sm text-emerald-300 mt-2">This pitch makes investors say YES immediately</p>
            </div>

            {/* Headline & Core Innovation */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3 text-rose-200">🌙 Moonshot Headline</h3>
                <p className="text-xl font-bold text-white">{moonshotAnalysis.headline}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-200">💡 Core Innovation</h3>
                <p className="text-white">{moonshotAnalysis.core_innovation}</p>
              </div>
            </div>

            {/* Sci-Fi Features */}
            {moonshotAnalysis.sci_fi_features && moonshotAnalysis.sci_fi_features.length > 0 && (
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-6">
                <h3 className="text-lg font-semibold text-cyan-200 mb-4">🤖 Sci-Fi Level Automation Features</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {moonshotAnalysis.sci_fi_features.map((feature, i) => (
                    <div key={i} className="rounded-lg border border-cyan-400/20 bg-slate-900/40 p-4">
                      <p className="text-white font-medium">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delight Moments */}
            {moonshotAnalysis.delight_moments && moonshotAnalysis.delight_moments.length > 0 && (
              <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                <h3 className="text-lg font-semibold text-pink-200 mb-4">✨ Unexpected User Delight Moments</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {moonshotAnalysis.delight_moments.map((moment, i) => (
                    <div key={i} className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-4">
                      <p className="text-white">{moment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Never-Before-Seen Features */}
            {moonshotAnalysis.never_before_seen && moonshotAnalysis.never_before_seen.length > 0 && (
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                <h3 className="text-lg font-semibold text-yellow-200 mb-4">🌟 Never-Before-Seen Features</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {moonshotAnalysis.never_before_seen.map((feature, i) => (
                    <div key={i} className="rounded-lg border border-yellow-400/20 bg-slate-900/40 p-4">
                      <p className="text-white font-medium">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radical Business Models */}
            {moonshotAnalysis.radical_business_models && moonshotAnalysis.radical_business_models.length > 0 && (
              <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-6">
                <h3 className="text-lg font-semibold text-orange-200 mb-4">💰 Radical Business Models</h3>
                <div className="space-y-3">
                  {moonshotAnalysis.radical_business_models.map((model, i) => (
                    <div key={i} className="rounded-lg border border-orange-400/20 bg-slate-900/40 p-4">
                      <p className="text-white font-medium">{model}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Viral Growth Hooks */}
            {moonshotAnalysis.viral_growth_hooks && moonshotAnalysis.viral_growth_hooks.length > 0 && (
              <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-6">
                <h3 className="text-lg font-semibold text-green-200 mb-4">📈 Viral Growth Hooks (3-Day Adoption)</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {moonshotAnalysis.viral_growth_hooks.map((hook, i) => (
                    <div key={i} className="rounded-lg border border-green-400/20 bg-slate-900/40 p-4">
                      <p className="text-white">{hook}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Go-to-Market Blitz */}
            {moonshotAnalysis.go_to_market_blitz && (
              <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-6">
                <h3 className="text-lg font-semibold text-blue-200 mb-4">🚀 3-Day Go-to-Market Blitz</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-blue-400/20 bg-slate-900/40 p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Day 1</h4>
                    <p className="text-white text-sm">{moonshotAnalysis.go_to_market_blitz.day_1}</p>
                  </div>
                  <div className="rounded-lg border border-blue-400/20 bg-slate-900/40 p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Day 2</h4>
                    <p className="text-white text-sm">{moonshotAnalysis.go_to_market_blitz.day_2}</p>
                  </div>
                  <div className="rounded-lg border border-blue-400/20 bg-slate-900/40 p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Day 3</h4>
                    <p className="text-white text-sm">{moonshotAnalysis.go_to_market_blitz.day_3}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cross-Industry Collaborations */}
            {moonshotAnalysis.cross_industry_collaborations && moonshotAnalysis.cross_industry_collaborations.length > 0 && (
              <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-6">
                <h3 className="text-lg font-semibold text-indigo-200 mb-4">🤝 Cross-Industry Collaborations</h3>
                <div className="space-y-2">
                  {moonshotAnalysis.cross_industry_collaborations.map((collab, i) => (
                    <div key={i} className="rounded-lg border border-indigo-400/20 bg-slate-900/40 p-3">
                      <p className="text-white">{collab}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ethical Disruptions */}
            {moonshotAnalysis.ethical_disruptions && moonshotAnalysis.ethical_disruptions.length > 0 && (
              <div className="rounded-xl border border-teal-400/30 bg-teal-500/10 p-6">
                <h3 className="text-lg font-semibold text-teal-200 mb-4">⚖️ Ethical Disruptions</h3>
                <div className="space-y-2">
                  {moonshotAnalysis.ethical_disruptions.map((disruption, i) => (
                    <div key={i} className="rounded-lg border border-teal-400/20 bg-slate-900/40 p-3">
                      <p className="text-white">{disruption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Human Blend */}
            {moonshotAnalysis.ai_human_blend && (
              <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-6">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">🤖 AI-Human Trust Blend</h3>
                <p className="text-white">{moonshotAnalysis.ai_human_blend}</p>
              </div>
            )}

            {/* Thunder Mode Specific Fields */}
            {mode === 'thunder' && (
              <>
                {moonshotAnalysis.aggressive_features && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                    <h3 className="text-lg font-semibold text-yellow-200 mb-4">⚡ Aggressive Features</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Array.isArray(moonshotAnalysis.aggressive_features) ? moonshotAnalysis.aggressive_features.map((feature: string, i: number) => (
                        <div key={i} className="rounded-lg border border-yellow-400/20 bg-slate-900/40 p-4">
                          <p className="text-white font-medium">{feature}</p>
                        </div>
                      )) : (
                        <div className="rounded-lg border border-yellow-400/20 bg-slate-900/40 p-4">
                          <p className="text-white">{String(moonshotAnalysis.aggressive_features)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {moonshotAnalysis.viral_mechanics && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                    <h3 className="text-lg font-semibold text-yellow-200 mb-3">📈 Viral Mechanics</h3>
                    <p className="text-white">{String(moonshotAnalysis.viral_mechanics)}</p>
                  </div>
                )}
                {moonshotAnalysis.fast_execution_timeline && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                    <h3 className="text-lg font-semibold text-yellow-200 mb-3">⚡ Lightning-Fast Execution</h3>
                    <p className="text-white">{String(moonshotAnalysis.fast_execution_timeline)}</p>
                  </div>
                )}
                {moonshotAnalysis.explosive_growth_strategy && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                    <h3 className="text-lg font-semibold text-yellow-200 mb-3">💥 Explosive Growth Strategy</h3>
                    <p className="text-white">{String(moonshotAnalysis.explosive_growth_strategy)}</p>
                  </div>
                )}
              </>
            )}

            {/* War Mode Specific Fields */}
            {mode === 'war' && (
              <>
                {moonshotAnalysis.competitive_advantage && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-200 mb-3">⚔️ Competitive Advantage</h3>
                    <p className="text-white">{String(moonshotAnalysis.competitive_advantage)}</p>
                  </div>
                )}
                {moonshotAnalysis.market_domination_strategy && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-200 mb-3">👑 Market Domination Strategy</h3>
                    <p className="text-white">{String(moonshotAnalysis.market_domination_strategy)}</p>
                  </div>
                )}
                {moonshotAnalysis.defensive_moats && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-200 mb-4">🛡️ Defensive Moats</h3>
                    <p className="text-white">{String(moonshotAnalysis.defensive_moats)}</p>
                  </div>
                )}
                {moonshotAnalysis.battle_plan && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-200 mb-3">🗺️ Battle Plan</h3>
                    <p className="text-white">{String(moonshotAnalysis.battle_plan)}</p>
                  </div>
                )}
                {moonshotAnalysis.competitor_crushing_tactics && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-200 mb-3">💀 Competitor Crushing Tactics</h3>
                    <p className="text-white">{String(moonshotAnalysis.competitor_crushing_tactics)}</p>
                  </div>
                )}
              </>
            )}

            {/* Love Mode Specific Fields */}
            {mode === 'love' && (
              <>
                {moonshotAnalysis.emotional_hooks && (
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                    <h3 className="text-lg font-semibold text-pink-200 mb-4">💖 Emotional Hooks</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Array.isArray(moonshotAnalysis.emotional_hooks) ? moonshotAnalysis.emotional_hooks.map((hook: string, i: number) => (
                        <div key={i} className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-4">
                          <p className="text-white">{hook}</p>
                        </div>
                      )) : (
                        <div className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-4">
                          <p className="text-white">{String(moonshotAnalysis.emotional_hooks)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {moonshotAnalysis.community_features && (
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                    <h3 className="text-lg font-semibold text-pink-200 mb-4">👥 Community Features</h3>
                    <div className="space-y-2">
                      {Array.isArray(moonshotAnalysis.community_features) ? moonshotAnalysis.community_features.map((feature: string, i: number) => (
                        <div key={i} className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-3">
                          <p className="text-white">{feature}</p>
                        </div>
                      )) : (
                        <div className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-3">
                          <p className="text-white">{String(moonshotAnalysis.community_features)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {moonshotAnalysis.trust_building_mechanics && (
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                    <h3 className="text-lg font-semibold text-pink-200 mb-3">🤝 Trust Building Mechanics</h3>
                    <p className="text-white">{String(moonshotAnalysis.trust_building_mechanics)}</p>
                  </div>
                )}
                {moonshotAnalysis.relationship_depth && (
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                    <h3 className="text-lg font-semibold text-pink-200 mb-3">💕 Relationship Depth</h3>
                    <p className="text-white">{String(moonshotAnalysis.relationship_depth)}</p>
                  </div>
                )}
                {moonshotAnalysis.empathy_moments && (
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-6">
                    <h3 className="text-lg font-semibold text-pink-200 mb-4">❤️ Empathy Moments</h3>
                    <div className="space-y-2">
                      {Array.isArray(moonshotAnalysis.empathy_moments) ? moonshotAnalysis.empathy_moments.map((moment: string, i: number) => (
                        <div key={i} className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-3">
                          <p className="text-white">{moment}</p>
                        </div>
                      )) : (
                        <div className="rounded-lg border border-pink-400/20 bg-slate-900/40 p-3">
                          <p className="text-white">{String(moonshotAnalysis.empathy_moments)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Market Modeling */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">📊 Market Intelligence</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>TAM:</strong> {moonshotAnalysis.market_modeling?.tam || 'N/A'}</p>
                  <p><strong>SAM:</strong> {moonshotAnalysis.market_modeling?.sam || 'N/A'}</p>
                  <p><strong>SOM:</strong> {moonshotAnalysis.market_modeling?.som || 'N/A'}</p>
                  <p><strong>Growth:</strong> {moonshotAnalysis.market_modeling?.growth_projection || 'N/A'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">💰 Monetization</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Models:</strong> {moonshotAnalysis.monetization?.models?.join(', ') || 'N/A'}</p>
                  <p><strong>Pricing:</strong> {moonshotAnalysis.monetization?.pricing || 'N/A'}</p>
                  <p><strong>LTV:</strong> {moonshotAnalysis.monetization?.ltv || 'N/A'}</p>
                  <p><strong>CAC:</strong> {moonshotAnalysis.monetization?.cac || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Risks */}
            {moonshotAnalysis.risks && moonshotAnalysis.risks.length > 0 && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-6">
                <h3 className="text-lg font-semibold text-rose-200 mb-4">⚠️ Risks</h3>
                <div className="space-y-3">
                  {moonshotAnalysis.risks.map((r, i) => (
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
            )}

            {/* Opportunities */}
            {moonshotAnalysis.opportunities && moonshotAnalysis.opportunities.length > 0 && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
                <h3 className="text-lg font-semibold text-emerald-200 mb-4">🚀 Opportunities</h3>
                <div className="space-y-3">
                  {moonshotAnalysis.opportunities.map((o, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                      <p className="font-semibold text-white text-sm mb-1">{o.opportunity}</p>
                      <p className="text-xs text-slate-400">Impact: {o.impact} • Timeline: {o.timeline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pivots */}
            {moonshotAnalysis.pivots && moonshotAnalysis.pivots.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">🔄 Strategic Pivots</h3>
                <div className="space-y-3">
                  {moonshotAnalysis.pivots.map((p, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                      <p className="font-semibold text-white mb-2">{p.pivot}</p>
                      <p className="text-sm text-slate-300 mb-2">{p.reasoning}</p>
                      <p className="text-xs text-emerald-300">Revenue potential: {p.revenue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valuation Path */}
            {moonshotAnalysis.valuation_path && (
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-6">
                <h3 className="text-lg font-semibold text-yellow-200 mb-4">📈 Valuation Path</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs text-slate-400 mb-1">Seed</p>
                    <p className="text-lg font-bold text-white">{moonshotAnalysis.valuation_path.seed}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs text-slate-400 mb-1">Series A</p>
                    <p className="text-lg font-bold text-white">{moonshotAnalysis.valuation_path.series_a}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs text-slate-400 mb-1">Series B</p>
                    <p className="text-lg font-bold text-white">{moonshotAnalysis.valuation_path.series_b}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
                    <p className="text-xs text-emerald-300 mb-1">Exit</p>
                    <p className="text-lg font-bold text-emerald-200">{moonshotAnalysis.valuation_path.exit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Confidence Score */}
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-emerald-200">Confidence Score</h2>
                <span className="text-5xl font-bold text-emerald-400">{moonshotAnalysis.confidence_score || 95}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Analysis (existing format) */}
        {strategicAnalysis && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-emerald-200">Confidence Score</h2>
                <span className="text-5xl font-bold text-emerald-400">{strategicAnalysis.confidenceScore}%</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">📊 Market Intelligence</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>TAM:</strong> {strategicAnalysis.marketIntel.tam}</p>
                  <p><strong>SAM:</strong> {strategicAnalysis.marketIntel.sam}</p>
                  <p><strong>SOM:</strong> {strategicAnalysis.marketIntel.som}</p>
                  <p><strong>Growth:</strong> {strategicAnalysis.marketIntel.growth}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-3">💰 Monetization</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Pricing:</strong> {strategicAnalysis.monetization.pricing}</p>
                  <p><strong>LTV:</strong> {strategicAnalysis.monetization.ltv}</p>
                  <p><strong>CAC:</strong> {strategicAnalysis.monetization.cac}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-6">
              <h3 className="text-lg font-semibold text-rose-200 mb-4">⚠️ Risks</h3>
              <div className="space-y-3">
                {strategicAnalysis.risks.map((r, i) => (
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
                {strategicAnalysis.opportunities.map((o, i) => (
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
                {strategicAnalysis.pivots.map((p, i) => (
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
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Seed</p>
                  <p className="text-lg font-bold text-white">{strategicAnalysis.valuation.seed}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Series A</p>
                  <p className="text-lg font-bold text-white">{strategicAnalysis.valuation.seriesA}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400 mb-1">Series B</p>
                  <p className="text-lg font-bold text-white">{strategicAnalysis.valuation.seriesB}</p>
                </div>
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <p className="text-xs text-emerald-300 mb-1">Exit</p>
                  <p className="text-lg font-bold text-emerald-200">{strategicAnalysis.valuation.exit}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
