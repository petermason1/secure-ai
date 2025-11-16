'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrendAgent {
  id: string;
  name: string;
  status: string;
  department: string;
  capabilities: string[];
  metadata: any;
}

interface TrendStats {
  trends_analyzed: number;
  content_generated: number;
  patterns_learned: number;
}

export default function TrendIntelligencePage() {
  const [agent, setAgent] = useState<TrendAgent | null>(null);
  const [stats, setStats] = useState<TrendStats>({ trends_analyzed: 0, content_generated: 0, patterns_learned: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analyze' | 'generate'>('overview');
  
  const [trendForm, setTrendForm] = useState({
    trend_topic: '',
    platform: 'all',
  });
  const [contentForm, setContentForm] = useState({
    trend_analysis_id: '',
    platform: 'twitter',
    content_type: 'post',
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [contentResult, setContentResult] = useState<any>(null);

  useEffect(() => {
    loadBot();
  }, []);

  const loadBot = async () => {
    try {
      const response = await fetch('/api/trend-intelligence/list');
      const data = await response.json();
      if (data.success) {
        setAgent(data.agent);
        setStats(data.stats || { trends_analyzed: 0, content_generated: 0, patterns_learned: 0 });
      }
    } catch (error) {
      console.error('Failed to load Trend Intelligence Bot:', error);
    }
  };

  const handleCreateBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trend-intelligence/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Trend Intelligence Bot created! This bot creates organic trending content WITHOUT paid advertising.');
        await loadBot();
      } else {
        alert('Error: ' + (data.error || 'Failed to create bot'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTrend = async () => {
    if (!trendForm.trend_topic.trim()) {
      alert('Trend topic is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/trend-intelligence/analyze-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trendForm),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data);
        setContentForm({ ...contentForm, trend_analysis_id: data.analysis_id });
        alert('Trend analyzed! Check the results below.');
        await loadBot();
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze trend'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!contentForm.trend_analysis_id) {
      alert('Please analyze a trend first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/trend-intelligence/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm),
      });

      const data = await response.json();
      if (data.success) {
        setContentResult(data);
        alert('Trending content generated! Designed for organic trending without paid ads.');
        await loadBot();
      } else {
        alert('Error: ' + (data.error || 'Failed to generate content'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            📈 Trend Intelligence Bot
          </h1>
          <p className="text-xl text-slate-300">
            Expert in creating organic trending content without paid advertising
          </p>
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-300 text-sm">
              <strong>🎯 Expertise:</strong> This bot understands the 6 key characteristics of trending items throughout history and creates content that will trend organically by tapping into cultural relevance, emotional connection, and natural visibility.
            </p>
          </div>
        </div>

        {!agent && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center mb-6">
            <p className="text-slate-400 mb-4">Trend Intelligence Bot not initialized</p>
            <button
              onClick={handleCreateBot}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Initialize Trend Intelligence Bot'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Trends Analyzed</p>
            <p className="text-2xl font-bold text-white">{stats.trends_analyzed}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Content Generated</p>
            <p className="text-2xl font-bold text-white">{stats.content_generated}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Patterns Learned</p>
            <p className="text-2xl font-bold text-white">{stats.patterns_learned}</p>
          </div>
        </div>

        {/* Agent Info */}
        {agent && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{agent.metadata?.icon || '📈'}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{agent.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {agent.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                    {agent.department}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">
                    No Paid Ads • Organic Only
                  </span>
                </div>
                <p className="text-slate-300 mb-3">
                  <strong>Knowledge Base:</strong> {agent.metadata?.knowledge_base?.join(', ') || 'Trend analysis patterns'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.slice(0, 6).map((cap, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['overview', 'analyze', 'generate'] as const).map((tab) => (
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
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">The 6 Characteristics of Trending Items</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-400 pl-4">
                  <h3 className="font-bold text-white mb-2">1. Cultural Relevance</h3>
                  <p className="text-slate-300 text-sm">Resonates with prevailing values, attitudes, and aspirations of the era</p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-bold text-white mb-2">2. Visibility & Rapid Adoption</h3>
                  <p className="text-slate-300 text-sm">Spreads quickly via influential channels—celebrity, media, social platforms</p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h3 className="font-bold text-white mb-2">3. Novelty & Differentiation</h3>
                  <p className="text-slate-300 text-sm">Novel concept, striking design, or innovation that sets it apart</p>
                </div>
                <div className="border-l-4 border-pink-400 pl-4">
                  <h3 className="font-bold text-white mb-2">4. Emotional Connection</h3>
                  <p className="text-slate-300 text-sm">Makes people feel part of something bigger—status, nostalgia, rebellion, belonging</p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h3 className="font-bold text-white mb-2">5. Lifecycle Pattern</h3>
                  <p className="text-slate-300 text-sm">Introduction → Rapid Rise → Mass Adoption → Oversaturation → Decline/Reinvention</p>
                </div>
                <div className="border-l-4 border-orange-400 pl-4">
                  <h3 className="font-bold text-white mb-2">6. Economic/Market Influence</h3>
                  <p className="text-slate-300 text-sm">Amplified by commercial interests, but this bot focuses on ORGANIC trending</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Analyze Trend</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Trend Topic *</label>
                  <input
                    type="text"
                    value={trendForm.trend_topic}
                    onChange={(e) => setTrendForm({ ...trendForm, trend_topic: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="e.g., AI productivity tools, sustainable fashion, remote work culture"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Platform</label>
                  <select
                    value={trendForm.platform}
                    onChange={(e) => setTrendForm({ ...trendForm, platform: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="all">All Platforms</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <button
                  onClick={handleAnalyzeTrend}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze Trend'}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-6">
                <h3 className="text-xl font-bold text-emerald-200 mb-4">Analysis Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Cultural Relevance</p>
                    <p className="text-2xl font-bold text-white">{(analysisResult.analysis.cultural_relevance_score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Novelty Score</p>
                    <p className="text-2xl font-bold text-white">{(analysisResult.analysis.novelty_score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Visibility Score</p>
                    <p className="text-2xl font-bold text-white">{(analysisResult.analysis.visibility_score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Opportunity Score</p>
                    <p className="text-2xl font-bold text-white">{(analysisResult.analysis.opportunity_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Emotional Driver</p>
                  <p className="text-white font-semibold">{analysisResult.analysis.emotional_driver}</p>
                  <p className="text-sm text-slate-400">Lifecycle Stage</p>
                  <p className="text-white font-semibold">{analysisResult.analysis.current_lifecycle_stage}</p>
                  <p className="text-sm text-slate-400">Recommended Angle</p>
                  <p className="text-white">{analysisResult.analysis.recommended_angle}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Generate Trending Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Platform *</label>
                  <select
                    value={contentForm.platform}
                    onChange={(e) => setContentForm({ ...contentForm, platform: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Content Type</label>
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="post">Post</option>
                    <option value="thread">Thread</option>
                    <option value="reel">Reel</option>
                    <option value="story">Story</option>
                  </select>
                </div>
                {!contentForm.trend_analysis_id && (
                  <p className="text-yellow-400 text-sm">⚠️ Please analyze a trend first in the "Analyze" tab</p>
                )}
                <button
                  onClick={handleGenerateContent}
                  disabled={loading || !contentForm.trend_analysis_id}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Organic Trending Content'}
                </button>
              </div>
            </div>

            {contentResult && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-6">
                <h3 className="text-xl font-bold text-emerald-200 mb-4">Generated Content</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Headline</p>
                    <p className="text-white font-semibold text-lg">{contentResult.content.headline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Content</p>
                    <p className="text-white whitespace-pre-wrap">{contentResult.content.content_text}</p>
                  </div>
                  {contentResult.content.hashtags && contentResult.content.hashtags.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Hashtags</p>
                      <div className="flex flex-wrap gap-2">
                        {contentResult.content.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="text-blue-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-sm text-slate-400">Organic Potential</p>
                      <p className="text-2xl font-bold text-emerald-400">{(contentResult.scores.organic_potential * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Expected Engagement</p>
                      <p className="text-2xl font-bold text-white">{(contentResult.scores.expected_engagement * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

