'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SeniorDevAgent {
  id: string;
  name: string;
  status: string;
  type: string;
  capabilities: string[];
  metadata: any;
}

interface SeniorDevStats {
  reviews_completed: number;
  issues_found: number;
  critical_issues: number;
}

interface CodeIssue {
  id: string;
  file_path: string;
  issue_type: string;
  severity: string;
  line_number?: number;
  code_snippet?: string;
  title: string;
  description: string;
  stack_overflow_reference?: string;
  suggested_fix?: string;
  status: string;
}

export default function SeniorDevPage() {
  const [agent, setAgent] = useState<SeniorDevAgent | null>(null);
  const [stats, setStats] = useState<SeniorDevStats>({ reviews_completed: 0, issues_found: 0, critical_issues: 0 });
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    file_path: '',
    file_content: '',
    language: '',
    review_type: 'full_review',
  });

  useEffect(() => {
    loadDepartment();
    loadIssues();
  }, []);

  const loadDepartment = async () => {
    try {
      const response = await fetch('/api/senior-dev/list');
      const data = await response.json();
      if (data.success) {
        setAgent(data.agent);
        setStats(data.stats || { reviews_completed: 0, issues_found: 0, critical_issues: 0 });
      }
    } catch (error) {
      console.error('Failed to load Senior Dev Department:', error);
    }
  };

  const loadIssues = async () => {
    try {
      const response = await fetch('/api/senior-dev/issues?limit=20');
      const data = await response.json();
      if (data.success) {
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  };

  const handleCreateDepartment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/senior-dev/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Senior Dev Department created! This expert does NOT use AI - only traditional code review methods.');
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

  const handleReviewCode = async () => {
    if (!reviewForm.file_path || !reviewForm.file_content) {
      alert('File path and content are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/senior-dev/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Review complete! Found ${data.issues_found} issues (${data.critical_issues} critical). Uses traditional methods, NOT AI.`);
        setReviewForm({ file_path: '', file_content: '', language: '', review_type: 'full_review' });
        setShowReviewForm(false);
        await loadIssues();
        await loadDepartment();
      } else {
        alert('Error: ' + (data.error || 'Failed to review code'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'bg-red-500/10 text-red-400';
      case 'bug':
        return 'bg-orange-500/10 text-orange-400';
      case 'performance':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'code_smell':
        return 'bg-purple-500/10 text-purple-400';
      default:
        return 'bg-slate-500/10 text-slate-400';
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
            👨‍💻 Senior Dev Review
          </h1>
          <p className="text-xl text-slate-300">
            Non-AI code expert who reviews AI-generated code using traditional methods, Stack Overflow, and old-school debugging
          </p>
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>⚠️ Important:</strong> This bot does NOT use AI. It uses pattern matching, Stack Overflow references, and traditional code review methods like a human senior developer would.
            </p>
          </div>
        </div>

        {!agent && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center mb-6">
            <p className="text-slate-400 mb-4">Senior Dev Department not initialized</p>
            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Initialize Senior Dev Department'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Reviews Completed</p>
            <p className="text-2xl font-bold text-white">{stats.reviews_completed}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Issues Found</p>
            <p className="text-2xl font-bold text-white">{stats.issues_found}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Critical Issues</p>
            <p className="text-2xl font-bold text-red-400">{stats.critical_issues}</p>
          </div>
        </div>

        {/* Agent Info */}
        {agent && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{agent.metadata?.icon || '👨‍💻'}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{agent.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {agent.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                    {agent.type} • {agent.metadata?.experience || 'Expert'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">
                    No AI • Traditional Methods
                  </span>
                </div>
                <p className="text-slate-300 mb-3">{agent.metadata?.tools?.join(' • ') || 'Stack Overflow • Code Analysis'}</p>
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

        {/* Review Code Form */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Code Review</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              {showReviewForm ? 'Cancel' : '+ Review Code'}
            </button>
          </div>

          {showReviewForm && (
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">File Path *</label>
                    <input
                      type="text"
                      value={reviewForm.file_path}
                      onChange={(e) => setReviewForm({ ...reviewForm, file_path: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="src/components/MyComponent.tsx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Language</label>
                    <select
                      value={reviewForm.language}
                      onChange={(e) => setReviewForm({ ...reviewForm, language: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    >
                      <option value="">Auto-detect</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Review Type</label>
                  <select
                    value={reviewForm.review_type}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="full_review">Full Review</option>
                    <option value="security_audit">Security Audit</option>
                    <option value="performance_check">Performance Check</option>
                    <option value="best_practices">Best Practices</option>
                    <option value="bug_hunt">Bug Hunt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Code Content *</label>
                  <textarea
                    value={reviewForm.file_content}
                    onChange={(e) => setReviewForm({ ...reviewForm, file_content: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white font-mono text-sm"
                    rows={12}
                    placeholder="Paste your code here..."
                  />
                </div>
                <button
                  onClick={handleReviewCode}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  {loading ? 'Reviewing...' : 'Review Code (Traditional Methods)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Issues List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Issues Found</h2>
          {issues.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
              <p className="text-slate-400">No issues found yet. Review some code to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getIssueTypeColor(issue.issue_type)}`}>
                          {issue.issue_type}
                        </span>
                        {issue.line_number && (
                          <span className="text-xs text-slate-400">Line {issue.line_number}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{issue.title}</h3>
                      <p className="text-slate-300 mb-3">{issue.description}</p>
                      {issue.code_snippet && (
                        <div className="bg-slate-800 rounded p-3 mb-3">
                          <code className="text-sm text-slate-300 font-mono">{issue.code_snippet}</code>
                        </div>
                      )}
                      {issue.suggested_fix && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mb-3">
                          <p className="text-sm text-emerald-300">
                            <strong>Suggested Fix:</strong> {issue.suggested_fix}
                          </p>
                        </div>
                      )}
                      {issue.stack_overflow_reference && (
                        <a
                          href={issue.stack_overflow_reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
                        >
                          📚 Stack Overflow Reference →
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 ml-4">
                      {issue.file_path}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

