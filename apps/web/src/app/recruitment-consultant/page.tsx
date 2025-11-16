'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecruitmentConsultantPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [targetRevenue, setTargetRevenue] = useState('1000000');
  const [targetTimeline, setTargetTimeline] = useState('12');
  const [focusAreas, setFocusAreas] = useState('all');

  useEffect(() => {
    loadRecommendations();
    loadReport();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/recruitment-consultant/recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadReport = async () => {
    try {
      const response = await fetch('/api/recruitment-consultant/report');
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/recruitment-consultant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_revenue: parseFloat(targetRevenue),
          target_timeline_months: parseInt(targetTimeline),
          focus_areas: focusAreas,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadRecommendations();
        await loadReport();
        alert('Analysis complete! Check recommendations below.');
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
    }
  };

  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'fractional':
        return 'bg-blue-500/20 text-blue-300';
      case 'contractor':
        return 'bg-purple-500/20 text-purple-300';
      case 'consultant':
        return 'bg-pink-500/20 text-pink-300';
      case 'freelance':
        return 'bg-cyan-500/20 text-cyan-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                Recruitment Consultant
              </h1>
              <p className="text-xl text-slate-300">
                Analyzes skill gaps, recommends human hires, forecasts cost/value, prioritizes hiring order
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="mb-8 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-6">
          <h2 className="text-2xl font-bold text-emerald-200 mb-4">Run Analysis</h2>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Target Revenue (ARR)</label>
              <input
                type="number"
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                placeholder="1000000"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Target Timeline (Months)</label>
              <input
                type="number"
                value={targetTimeline}
                onChange={(e) => setTargetTimeline(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Focus Areas</label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                placeholder="all, sales, legal, partnerships"
              />
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition-colors"
          >
            {analyzing ? 'Analyzing...' : 'Analyze & Generate Recommendations'}
          </button>
        </div>

        {/* Summary Report */}
        {report && (
          <div className="mb-8 rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Summary Report</h2>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                <p className="text-sm text-slate-400 mb-1">Total Recommendations</p>
                <p className="text-2xl font-bold text-white">{report.summary.total_recommendations}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                <p className="text-sm text-slate-400 mb-1">Total Cost (Monthly)</p>
                <p className="text-2xl font-bold text-white">
                  £{report.summary.total_cost_min.toLocaleString()} - £{report.summary.total_cost_max.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                <p className="text-sm text-slate-400 mb-1">Revenue Impact (Annual)</p>
                <p className="text-2xl font-bold text-emerald-400">£{report.summary.total_revenue_impact.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                <p className="text-sm text-slate-400 mb-1">ROI Estimate</p>
                <p className="text-2xl font-bold text-emerald-400">{report.summary.roi_estimate}%</p>
              </div>
            </div>

            {/* By Urgency */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">By Urgency</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-300 mb-1">Critical</p>
                  <p className="text-2xl font-bold text-red-200">{report.by_urgency.critical.length}</p>
                </div>
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                  <p className="text-sm text-orange-300 mb-1">High</p>
                  <p className="text-2xl font-bold text-orange-200">{report.by_urgency.high.length}</p>
                </div>
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <p className="text-sm text-yellow-300 mb-1">Medium</p>
                  <p className="text-2xl font-bold text-yellow-200">{report.by_urgency.medium.length}</p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="text-sm text-blue-300 mb-1">Low</p>
                  <p className="text-2xl font-bold text-blue-200">{report.by_urgency.low.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Hiring Recommendations</h2>
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No recommendations yet</p>
              <p className="text-sm">Run an analysis above to generate hiring recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-4 ${getUrgencyColor(rec.urgency)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{rec.role_title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getRoleTypeColor(rec.role_type)}`}>
                          {rec.role_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          Priority: {rec.priority_score}/100
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{rec.impact_forecast}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Cost (Monthly)</p>
                      <p className="text-sm font-semibold text-white">
                        £{rec.cost_estimate_min?.toLocaleString() || 0} - £{rec.cost_estimate_max?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Revenue Impact (Annual)</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        £{rec.revenue_impact?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Timeline</p>
                      <p className="text-sm font-semibold text-white">{rec.timeline_weeks} weeks</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">ROI</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {rec.revenue_impact && rec.cost_estimate_max
                          ? (((rec.revenue_impact / 12 - rec.cost_estimate_max) / rec.cost_estimate_max) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {rec.required_skills && rec.required_skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-400 mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.required_skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

