'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SEOBot {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  icon?: string;
}

interface SEOStats {
  keywords_tracked: number;
  backlinks: number;
  tasks_pending: number;
}

export default function SEODepartmentPage() {
  const [bots, setBots] = useState<SEOBot[]>([]);
  const [stats, setStats] = useState<SEOStats>({ keywords_tracked: 0, backlinks: 0, tasks_pending: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'keyword-research' | 'content-analysis' | 'technical-audit'>('overview');
  
  // Forms
  const [keywordForm, setKeywordForm] = useState({ topic: '', target_audience: '', intent: 'informational' });
  const [contentForm, setContentForm] = useState({ url: '', title: '', content: '', meta_description: '' });
  const [auditForm, setAuditForm] = useState({ url: '', site_structure: '', robots_txt: '', sitemap_url: '' });

  useEffect(() => {
    loadDepartment();
  }, []);

  const loadDepartment = async () => {
    try {
      const response = await fetch('/api/seo-department/list');
      const data = await response.json();
      if (data.success) {
        setBots(data.agents || []);
        setStats(data.stats || { keywords_tracked: 0, backlinks: 0, tasks_pending: 0 });
      }
    } catch (error) {
      console.error('Failed to load SEO Department:', error);
    }
  };

  const handleCreateDepartment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo-department/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('SEO Department created successfully!');
        await loadDepartment();
      } else {
        alert('Error: ' + (data.error || 'Failed to create department'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordResearch = async () => {
    if (!keywordForm.topic.trim()) {
      alert('Topic is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seo-department/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keywordForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Found ${data.keywords?.length || 0} keywords! Check the database.`);
        setKeywordForm({ topic: '', target_audience: '', intent: 'informational' });
      } else {
        alert('Error: ' + (data.error || 'Failed to research keywords'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContentAnalysis = async () => {
    if (!contentForm.url || !contentForm.content) {
      alert('URL and content are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seo-department/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Content analyzed! SEO Score: ${data.analysis?.seo_score || 'N/A'}`);
        setContentForm({ url: '', title: '', content: '', meta_description: '' });
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze content'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicalAudit = async () => {
    if (!auditForm.url.trim()) {
      alert('URL is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seo-department/technical-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Technical audit completed! Score: ${data.audit?.technical_seo_score || 'N/A'}`);
        setAuditForm({ url: '', site_structure: '', robots_txt: '', sitemap_url: '' });
      } else {
        alert('Error: ' + (data.error || 'Failed to perform audit'));
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
            🔍 SEO Department
          </h1>
          <p className="text-xl text-slate-300">
            Search Engine Optimization - Technical, Content, Link Building, Analytics, Competitor Intelligence, and Local SEO
          </p>
        </div>

        {bots.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center mb-6">
            <p className="text-slate-400 mb-4">SEO Department not initialized</p>
            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Initialize SEO Department'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Keywords Tracked</p>
            <p className="text-2xl font-bold text-white">{stats.keywords_tracked}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Backlinks</p>
            <p className="text-2xl font-bold text-white">{stats.backlinks}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Pending Tasks</p>
            <p className="text-2xl font-bold text-white">{stats.tasks_pending}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['overview', 'keyword-research', 'content-analysis', 'technical-audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">SEO Bots</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <div key={bot.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{bot.icon || '🤖'}</span>
                    <div>
                      <h3 className="font-bold text-white">{bot.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bot.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {bot.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bot.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyword Research Tab */}
        {activeTab === 'keyword-research' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Keyword Research</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Topic *</label>
                <input
                  type="text"
                  value={keywordForm.topic}
                  onChange={(e) => setKeywordForm({ ...keywordForm, topic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="e.g., AI startup ideas"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={keywordForm.target_audience}
                  onChange={(e) => setKeywordForm({ ...keywordForm, target_audience: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="e.g., solo founders"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Intent</label>
                <select
                  value={keywordForm.intent}
                  onChange={(e) => setKeywordForm({ ...keywordForm, intent: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                >
                  <option value="informational">Informational</option>
                  <option value="navigational">Navigational</option>
                  <option value="transactional">Transactional</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <button
                onClick={handleKeywordResearch}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Researching...' : 'Research Keywords'}
              </button>
            </div>
          </div>
        )}

        {/* Content Analysis Tab */}
        {activeTab === 'content-analysis' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Content SEO Analysis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">URL *</label>
                <input
                  type="url"
                  value={contentForm.url}
                  onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="https://example.com/page"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="Page title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Content *</label>
                <textarea
                  value={contentForm.content}
                  onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={6}
                  placeholder="Page content..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Meta Description</label>
                <textarea
                  value={contentForm.meta_description}
                  onChange={(e) => setContentForm({ ...contentForm, meta_description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={2}
                  placeholder="Meta description..."
                />
              </div>
              <button
                onClick={handleContentAnalysis}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze Content'}
              </button>
            </div>
          </div>
        )}

        {/* Technical Audit Tab */}
        {activeTab === 'technical-audit' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Technical SEO Audit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">URL *</label>
                <input
                  type="url"
                  value={auditForm.url}
                  onChange={(e) => setAuditForm({ ...auditForm, url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Site Structure (Optional)</label>
                <textarea
                  value={auditForm.site_structure}
                  onChange={(e) => setAuditForm({ ...auditForm, site_structure: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={3}
                  placeholder="Describe site structure..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Robots.txt URL</label>
                  <input
                    type="url"
                    value={auditForm.robots_txt}
                    onChange={(e) => setAuditForm({ ...auditForm, robots_txt: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="https://example.com/robots.txt"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sitemap URL</label>
                  <input
                    type="url"
                    value={auditForm.sitemap_url}
                    onChange={(e) => setAuditForm({ ...auditForm, sitemap_url: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="https://example.com/sitemap.xml"
                  />
                </div>
              </div>
              <button
                onClick={handleTechnicalAudit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Auditing...' : 'Run Technical Audit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

