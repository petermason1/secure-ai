'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Advisory {
  id: string;
  question: string;
  status: string;
  priority: string;
  response?: any;
  created_at: string;
  answered_at?: string;
}

interface SecurityTeamMember {
  id: string;
  name: string;
  type: 'bot' | 'human';
  status: string;
  capabilities?: string[];
  expertise?: string[];
  avatar?: string;
  avatar_url?: string;
  role?: string;
  last_activity?: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface BestPractice {
  id: string;
  category: string;
  title: string;
  content: string;
  do_items: string[];
  dont_items: string[];
  checklist_items: string[];
  priority: string;
}

export default function SecurityAdvisoryPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<any>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [teamMembers, setTeamMembers] = useState<SecurityTeamMember[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [showReviewRequest, setShowReviewRequest] = useState(false);
  const [reviewRequest, setReviewRequest] = useState({
    review_type: 'code',
    title: '',
    description: '',
    resource_url: '',
    priority: 'medium',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'qa' | 'team' | 'alerts' | 'practices' | 'audit'>('qa');

  useEffect(() => {
    loadAdvisories();
    loadTeam();
    loadAlerts();
    loadBestPractices();
  }, []);

  const loadAdvisories = async () => {
    try {
      const response = await fetch('/api/security/advisory/list');
      const data = await response.json();
      if (data.success) {
        setAdvisories(data.advisories || []);
      }
    } catch (error) {
      console.error('Failed to load advisories:', error);
    }
  };

  const loadTeam = async () => {
    try {
      const response = await fetch('/api/security/team');
      const data = await response.json();
      if (data.success) {
        setTeamMembers([...data.bots, ...data.members]);
      }
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/security/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadBestPractices = async () => {
    try {
      const response = await fetch('/api/security/best-practices');
      const data = await response.json();
      if (data.success) {
        setBestPractices(data.practices || []);
      }
    } catch (error) {
      console.error('Failed to load best practices:', error);
    }
  };

  const askSecurityTeam = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/security/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      const data = await response.json();
      if (data.success) {
        setAdvisory(data.advisory);
        setQuestion('');
        setContext('');
        await loadAdvisories();
      } else {
        alert('Error: ' + (data.error || 'Failed to get security advisory'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAdvisoryStatus = async (advisoryId: string, status: string) => {
    try {
      const response = await fetch('/api/security/advisory/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisory_id: advisoryId, status }),
      });

      if (response.ok) {
        await loadAdvisories();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const submitReviewRequest = async () => {
    if (!reviewRequest.title || !reviewRequest.description) {
      alert('Title and description are required');
      return;
    }

    try {
      const response = await fetch('/api/security/review-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewRequest),
      });

      const data = await response.json();
      if (data.success) {
        alert('Review request submitted successfully!');
        setShowReviewRequest(false);
        setReviewRequest({
          review_type: 'code',
          title: '',
          description: '',
          resource_url: '',
          priority: 'medium',
        });
      } else {
        alert('Error: ' + (data.error || 'Failed to submit review request'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'answered':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'escalated':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const filteredAdvisories = advisories.filter((adv) => {
    const matchesSearch = !searchTerm || 
      adv.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || adv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const recentAdvisories = filteredAdvisories.slice(0, 5);
  const openAlerts = alerts.filter(a => a.status === 'open');
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            🔒 Security Advisory Hub
          </h1>
          <p className="text-xl text-slate-300">
            Centralized security intelligence, privacy protection, and code/IP security
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Total Advisories</p>
            <p className="text-2xl font-bold text-white">{advisories.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Open Alerts</p>
            <p className="text-2xl font-bold text-orange-400">{openAlerts.length}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Critical Alerts</p>
            <p className="text-2xl font-bold text-red-400">{criticalAlerts.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Security Team</p>
            <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['qa', 'team', 'alerts', 'practices', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'qa' && 'Q&A'}
              {tab === 'team' && 'Team'}
              {tab === 'alerts' && 'Alerts'}
              {tab === 'practices' && 'Best Practices'}
              {tab === 'audit' && 'Audit Log'}
            </button>
          ))}
        </div>

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="space-y-6">
            {/* Q&A Widget */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Ask Security Team</h2>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                    rows={3}
                    placeholder="Ask security team a question about privacy, code protection, compliance..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Context (Optional)</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                    rows={2}
                    placeholder="Additional context or background information..."
                  />
                </div>
              </div>
              <button
                onClick={askSecurityTeam}
                disabled={loading || !question.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Asking Security Team...' : 'Submit Question'}
              </button>
            </div>

            {/* Response */}
            {advisory && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-6">
                <h3 className="text-xl font-bold text-emerald-200 mb-4">Security Advisory Response</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-slate-400">Risk Assessment: </span>
                    <span className={`font-semibold ${
                      advisory.risk_assessment === 'critical' ? 'text-red-400' :
                      advisory.risk_assessment === 'high' ? 'text-orange-400' :
                      advisory.risk_assessment === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {advisory.risk_assessment?.toUpperCase()}
                    </span>
                  </div>

                  {advisory.recommendations && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                      <div className="space-y-3">
                        {advisory.recommendations.map((rec: any, i: number) => (
                          <div key={i} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(rec.priority)}`}>
                                {rec.priority?.toUpperCase()}
                              </span>
                              <h5 className="font-semibold text-white">{rec.action}</h5>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{rec.reason}</p>
                            {rec.impact && (
                              <p className="text-xs text-slate-400">Impact: {rec.impact}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {advisory.immediate_actions && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">Immediate Actions</h4>
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {advisory.immediate_actions.map((action: string, i: number) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Advisories */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Recent Advisories</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="answered">Answered</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {filteredAdvisories.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No advisories found</p>
                ) : (
                  filteredAdvisories.map((adv) => (
                    <div key={adv.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">{adv.question}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(adv.status)}`}>
                              {adv.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(adv.priority)}`}>
                              {adv.priority}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(adv.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {adv.status === 'answered' && (
                            <button
                              onClick={() => updateAdvisoryStatus(adv.id, 'resolved')}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
                            >
                              Mark Resolved
                            </button>
                          )}
                          {adv.status !== 'escalated' && (
                            <button
                              onClick={() => updateAdvisoryStatus(adv.id, 'escalated')}
                              className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
                            >
                              Escalate
                            </button>
                          )}
                        </div>
                      </div>
                      {adv.response && (
                        <div className="mt-3 p-3 bg-slate-900/60 rounded text-sm text-slate-300">
                          <strong>Response:</strong> {JSON.stringify(adv.response).substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Security Team</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">
                      {member.avatar || member.avatar_url || (member.type === 'bot' ? '🤖' : '👤')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="text-xs text-slate-400">
                        {member.type === 'bot' ? 'AI Bot' : member.role || 'Team Member'}
                      </p>
                    </div>
                  </div>
                  {member.capabilities && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {member.capabilities.slice(0, 3).map((cap, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          {cap.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.expertise && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {member.expertise.slice(0, 3).map((exp, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Last activity: {member.last_activity ? new Date(member.last_activity).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">No alerts found</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' :
                    alert.severity === 'high' ? 'border-orange-500/50 bg-orange-500/10' :
                    'border-white/10 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          {alert.alert_type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{alert.title}</h3>
                      <p className="text-sm text-slate-300">{alert.description}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Best Practices Tab */}
        {activeTab === 'practices' && (
          <div className="space-y-4">
            {bestPractices.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400 mb-4">No best practices loaded</p>
                <p className="text-sm text-slate-500">Best practices will be populated by security team</p>
              </div>
            ) : (
              bestPractices.map((practice) => (
                <div key={practice.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(practice.priority)}`}>
                      {practice.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                      {practice.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{practice.title}</h3>
                  <p className="text-slate-300 mb-4">{practice.content}</p>
                  
                  {practice.do_items && practice.do_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-emerald-300 mb-2">✅ Do's</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                        {practice.do_items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {practice.dont_items && practice.dont_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-300 mb-2">❌ Don'ts</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                        {practice.dont_items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {practice.checklist_items && practice.checklist_items.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">📋 Checklist</h4>
                      <ul className="space-y-2">
                        {practice.checklist_items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Security Audit Log</h2>
            <p className="text-slate-400 mb-4">
              Complete history of security-related actions and events
            </p>
            <div className="text-center py-12 text-slate-400">
              <p>Audit log will display here</p>
              <p className="text-sm mt-2">Use API endpoint: GET /api/security/audit-log</p>
            </div>
          </div>
        )}

        {/* Secure Actions */}
        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Secure Actions</h2>
            <button
              onClick={() => setShowReviewRequest(!showReviewRequest)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              {showReviewRequest ? 'Cancel' : '+ Request Code/IP Review'}
            </button>
          </div>

          {showReviewRequest && (
            <div className="mt-4 p-4 bg-slate-800/40 rounded-lg space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Review Type</label>
                <select
                  value={reviewRequest.review_type}
                  onChange={(e) => setReviewRequest({ ...reviewRequest, review_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                >
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                  <option value="ip">IP/Intellectual Property</option>
                  <option value="document">Document</option>
                  <option value="api_endpoint">API Endpoint</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={reviewRequest.title}
                  onChange={(e) => setReviewRequest({ ...reviewRequest, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="Brief title for the review request"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={reviewRequest.description}
                  onChange={(e) => setReviewRequest({ ...reviewRequest, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={4}
                  placeholder="Detailed description of what needs to be reviewed..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Resource URL (Optional)</label>
                <input
                  type="url"
                  value={reviewRequest.resource_url}
                  onChange={(e) => setReviewRequest({ ...reviewRequest, resource_url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Priority</label>
                <select
                  value={reviewRequest.priority}
                  onChange={(e) => setReviewRequest({ ...reviewRequest, priority: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button
                onClick={submitReviewRequest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                Submit Review Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
