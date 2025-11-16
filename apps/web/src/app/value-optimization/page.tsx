'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ValueOpportunity {
  id: string;
  opportunity_type: string;
  title: string;
  description: string;
  estimated_value_impact: number;
  confidence_score: number;
  effort_level: string;
  time_to_complete_days: number;
  priority: string;
  status: string;
}

interface ValueStats {
  total_opportunities: number;
  total_potential_value: number;
  completed_opportunities: number;
  value_realized: number;
}

export default function ValueOptimizationPage() {
  const [agent, setAgent] = useState<any>(null);
  const [stats, setStats] = useState<ValueStats>({
    total_opportunities: 0,
    total_potential_value: 0,
    completed_opportunities: 0,
    value_realized: 0,
  });
  const [opportunities, setOpportunities] = useState<ValueOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analyze' | 'opportunities'>('overview');
  
  const [analysisForm, setAnalysisForm] = useState({
    company_info: '',
    current_revenue: '',
    current_profit: '',
    current_margin: '',
    sector: '',
  });

  useEffect(() => {
    loadBot();
    loadOpportunities();
  }, []);

  const loadBot = async () => {
    try {
      const response = await fetch('/api/value-optimization/list');
      const data = await response.json();
      if (data.success) {
        setAgent(data.agent);
        setStats(data.stats || {
          total_opportunities: 0,
          total_potential_value: 0,
          completed_opportunities: 0,
          value_realized: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load Value Optimization Bot:', error);
    }
  };

  const loadOpportunities = async () => {
    try {
      const response = await fetch('/api/value-optimization/opportunities');
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
        setStats(prev => ({
          ...prev,
          total_opportunities: data.count || 0,
          total_potential_value: data.total_potential_value || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    }
  };

  const handleCreateBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/value-optimization/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Value Optimization Department created! Expert in actions that add £1M+ in value instantly.');
        await loadBot();
      } else {
        alert('Error: ' + (data.error || 'Failed to create department'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisForm.company_info.trim()) {
      alert('Company info is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/value-optimization/analyze-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...analysisForm,
          current_revenue: analysisForm.current_revenue ? parseFloat(analysisForm.current_revenue) : undefined,
          current_profit: analysisForm.current_profit ? parseFloat(analysisForm.current_profit) : undefined,
          current_margin: analysisForm.current_margin ? parseFloat(analysisForm.current_margin) : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Found ${data.opportunities.length} opportunities worth £${data.total_potential_value.toLocaleString()}!`);
        setAnalysisForm({
          company_info: '',
          current_revenue: '',
          current_profit: '',
          current_margin: '',
          sector: '',
        });
        await loadOpportunities();
        await loadBot();
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      profit_adjustment: 'Profit Adjustment',
      gross_margin_improvement: 'Margin Improvement',
      revenue_growth_demonstration: 'Revenue Growth',
      ip_protection: 'IP Protection',
      financial_audit: 'Financial Audit',
      tier1_customer: 'Tier 1 Customer',
      tier1_investor: 'Tier 1 Investor',
      pr_media_win: 'PR/Media Win',
      feature_release: 'Feature Release',
      industry_award: 'Industry Award',
      strategic_partnership: 'Strategic Partnership',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            💎 Value Optimization
          </h1>
          <p className="text-xl text-slate-300">
            Actions that can add £1M+ in company value instantly
          </p>
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-300 text-sm">
              <strong>🎯 8 Instant Value-Adding Actions:</strong> Profit adjustments, margin improvements, IP protection, Tier 1 relationships, PR wins, financial audits, feature releases, strategic partnerships
            </p>
          </div>
        </div>

        {!agent && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center mb-6">
            <p className="text-slate-400 mb-4">Value Optimization Department not initialized</p>
            <button
              onClick={handleCreateBot}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Initialize Value Optimization'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Total Opportunities</p>
            <p className="text-2xl font-bold text-white">{stats.total_opportunities}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Potential Value</p>
            <p className="text-2xl font-bold text-emerald-400">£{stats.total_potential_value.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">{stats.completed_opportunities}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Value Realized</p>
            <p className="text-2xl font-bold text-white">£{stats.value_realized.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['overview', 'analyze', 'opportunities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {agent && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{agent.metadata?.icon || '💎'}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{agent.name}</h2>
                    <p className="text-slate-300 mb-3">{agent.metadata?.expertise || 'Value Optimization'}</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.metadata?.focus_areas?.map((area: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">8 Instant Value-Adding Actions</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border-l-4 border-emerald-400 pl-4">
                  <h3 className="font-bold text-white mb-2">1. Profit Adjustment</h3>
                  <p className="text-slate-300 text-sm">Replace owner salary with market rate, remove one-off expenses</p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-bold text-white mb-2">2. Gross Margin Improvement</h3>
                  <p className="text-slate-300 text-sm">Optimize pricing, reduce costs, create product bundles</p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h3 className="font-bold text-white mb-2">3. Revenue Growth Demonstration</h3>
                  <p className="text-slate-300 text-sm">Show sustainable growth above sector average</p>
                </div>
                <div className="border-l-4 border-pink-400 pl-4">
                  <h3 className="font-bold text-white mb-2">4. IP Protection</h3>
                  <p className="text-slate-300 text-sm">File patents, trademarks, copyrights</p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h3 className="font-bold text-white mb-2">5. Financial Audit</h3>
                  <p className="text-slate-300 text-sm">Clean, audited accounts create trust and value</p>
                </div>
                <div className="border-l-4 border-orange-400 pl-4">
                  <h3 className="font-bold text-white mb-2">6. Tier 1 Customer</h3>
                  <p className="text-slate-300 text-sm">Sign flagship client (even pilot/POC)</p>
                </div>
                <div className="border-l-4 border-red-400 pl-4">
                  <h3 className="font-bold text-white mb-2">7. Tier 1 Investor</h3>
                  <p className="text-slate-300 text-sm">Attract institutional investor</p>
                </div>
                <div className="border-l-4 border-teal-400 pl-4">
                  <h3 className="font-bold text-white mb-2">8. PR/Media Wins</h3>
                  <p className="text-slate-300 text-sm">Viral press features, thought leadership, awards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Analyze Company for Value Opportunities</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Company Info *</label>
                <textarea
                  value={analysisForm.company_info}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, company_info: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={4}
                  placeholder="Describe your company: industry, size, current situation, challenges..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Current Revenue (£)</label>
                  <input
                    type="number"
                    value={analysisForm.current_revenue}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, current_revenue: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Current Profit (£)</label>
                  <input
                    type="number"
                    value={analysisForm.current_profit}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, current_profit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Current Margin (%)</label>
                  <input
                    type="number"
                    value={analysisForm.current_margin}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, current_margin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sector</label>
                  <input
                    type="text"
                    value={analysisForm.sector}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, sector: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="e.g., SaaS, E-commerce, Fintech"
                  />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze for Value Opportunities'}
              </button>
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Value Opportunities</h2>
            {opportunities.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">No opportunities found yet. Analyze your company to discover value-adding actions!</p>
              </div>
            ) : (
              opportunities.map((opp) => (
                <div key={opp.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                          {getTypeLabel(opp.opportunity_type)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(opp.priority)}`}>
                          {opp.priority}
                        </span>
                        <span className="text-xs text-slate-400">
                          {opp.effort_level} effort • {opp.time_to_complete_days} days
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{opp.title}</h3>
                      <p className="text-slate-300 mb-3">{opp.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-emerald-400">£{opp.estimated_value_impact.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{(opp.confidence_score * 100).toFixed(0)}% confidence</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

