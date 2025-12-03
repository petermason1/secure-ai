'use client';

import { useState } from 'react';

export default function APIDemoPage() {
  const [activeTab, setActiveTab] = useState('credits');
  const [userId, setUserId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setResults(null);
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(endpoint, options);
      const data = await response.json();
      setResults({ success: response.ok, data, status: response.status });
    } catch (error: any) {
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-6 py-12 min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Demo & Testing</h1>
          <p className="text-slate-300">Test all business APIs in real-time</p>
        </header>

        {/* User Context */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">User Context</h2>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-slate-400 mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user-123"
                className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company ID (optional)</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="company-456"
                className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {[
            { id: 'credits', label: 'Credits System' },
            { id: 'junior-dev', label: 'Junior Dev Team' },
            { id: 'ceo-calls', label: 'CEO Calls' },
            { id: 'workflows', label: 'Workflows' },
            { id: 'leads', label: 'Leads' },
            { id: 'status', label: 'API Status' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">Credits System</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Check Credit Status</h3>
                  <button
                    onClick={() => makeRequest(`/api/credits/status?userId=${userId || 'demo-user'}`)}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Get Status
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Purchase Credits</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/credits/purchase', 'POST', {
                        userId: userId || 'demo-user',
                        companyId: companyId || null,
                        amount: 100,
                        description: 'Demo purchase',
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Purchase 100 Credits
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Spend Credits</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/credits/spend', 'POST', {
                        userId: userId || 'demo-user',
                        amount: 25,
                        service: 'api-call',
                        description: 'Demo service usage',
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                  >
                    Spend 25 Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Junior Dev Team Tab */}
        {activeTab === 'junior-dev' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">Junior Dev Team</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Activate JIT Session</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/junior-dev-team/jit/activate', 'POST', {
                        userId: userId || 'demo-user',
                        companyId: companyId || null,
                        task: 'Build a user authentication system',
                        context: { framework: 'Next.js', priority: 'high' },
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    Create JIT Session
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Get Kanban Board</h3>
                  <button
                    onClick={() =>
                      makeRequest(`/api/junior-dev-team/kanban/board?userId=${userId || 'demo-user'}`)
                    }
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Load Board
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Create Task</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/junior-dev-team/kanban/board', 'POST', {
                        userId: userId || 'demo-user',
                        companyId: companyId || null,
                        title: 'Implement payment gateway',
                        description: 'Integrate Stripe for credit purchases',
                        priority: 'high',
                        tags: ['backend', 'payments'],
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CEO Calls Tab */}
        {activeTab === 'ceo-calls' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">CEO Call System</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Log CEO Call</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/ceo/call', 'POST', {
                        userId: userId || 'demo-user',
                        companyId: companyId || null,
                        callType: 'investor',
                        participant: 'John Doe',
                        topic: 'Series A funding discussion',
                        priority: 'high',
                        scheduledAt: new Date().toISOString(),
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50"
                  >
                    Log Call
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">List Calls</h3>
                  <button
                    onClick={() =>
                      makeRequest(`/api/ceo/call?userId=${userId || 'demo-user'}`)
                    }
                    disabled={loading}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    Get Calls
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Complete Call</h3>
                  <p className="text-xs text-slate-400 mb-2">
                    (First create a call, then use its ID to complete it)
                  </p>
                  <button
                    onClick={() =>
                      makeRequest('/api/ceo/call', 'PATCH', {
                        callId: 'example-call-id',
                        status: 'completed',
                        duration: 30,
                        outcome: 'Positive discussion, follow-up scheduled',
                        actionItems: ['Send term sheet', 'Schedule next call'],
                        nextSteps: 'Review proposal by Friday',
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Complete Call (Example)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">Workflow Automation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Trigger Payment Research</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/workflows/payment-trigger-research', 'POST', {
                        userId: userId || 'demo-user',
                        companyId: companyId || null,
                        workflowType: 'payment',
                        trigger: 'subscription_renewal',
                        context: { amount: 99.99, currency: 'USD' },
                        priority: 'high',
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                  >
                    Start Research
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Get Research Results</h3>
                  <button
                    onClick={() =>
                      makeRequest(`/api/workflows/payment-trigger-research?userId=${userId || 'demo-user'}`)
                    }
                    disabled={loading}
                    className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                  >
                    List Research Tasks
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">Lead Management</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Create Lead</h3>
                  <button
                    onClick={() =>
                      makeRequest('/api/leads', 'POST', {
                        companyName: 'Acme Corp',
                        email: 'contact@acme.com',
                        offer: 'Ops Chaperone',
                        contactName: 'Jane Smith',
                        role: 'CTO',
                        budgetBand: '£10k-£15k',
                        urgency: 'high',
                      })
                    }
                    disabled={loading}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Create Lead
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">List Leads</h3>
                  <button
                    onClick={() => makeRequest('/api/leads')}
                    disabled={loading}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
                  >
                    Get All Leads
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter Leads</h3>
                  <button
                    onClick={() => makeRequest('/api/leads?status=New&limit=10')}
                    disabled={loading}
                    className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium hover:bg-fuchsia-700 disabled:opacity-50"
                  >
                    Get New Leads
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">API Status & Documentation</h2>
              <button
                onClick={() => makeRequest('/api/status')}
                disabled={loading}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 mb-4"
              >
                Get API Status
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-blue-500/50 bg-blue-500/10 p-4">
            <p className="text-blue-400">Loading...</p>
          </div>
        )}

        {results && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Response</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  results.success
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {results.status || (results.success ? 'Success' : 'Error')}
              </span>
            </div>
            <pre className="overflow-auto text-xs bg-slate-950/50 p-4 rounded-lg border border-white/10">
              {JSON.stringify(results.data || results.error || results, null, 2)}
            </pre>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className="rounded-lg border border-white/25 px-3 py-1 text-sm hover:border-white"
            >
              ← Home
            </a>
            <a
              href="/ideas"
              className="rounded-lg border border-white/25 px-3 py-1 text-sm hover:border-white"
            >
              Ideas
            </a>
            <a
              href="/prompts"
              className="rounded-lg border border-white/25 px-3 py-1 text-sm hover:border-white"
            >
              Prompts
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

