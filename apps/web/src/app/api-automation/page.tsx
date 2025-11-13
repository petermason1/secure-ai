'use client';

import { useState } from 'react';

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'testing' | 'live' | 'error';
  apis: string[];
  executions: number;
  successRate: number;
};

export default function APIAutomation() {
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'New Customer Onboarding',
      description: 'Stripe → Supabase → SendGrid → Slack',
      status: 'live',
      apis: ['Stripe', 'Supabase', 'SendGrid', 'Slack'],
      executions: 1247,
      successRate: 99.2
    }
  ]);

  async function generateWorkflow() {
    if (!input) return;
    
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock workflow generation
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'Custom Workflow',
      description: input.slice(0, 50) + '...',
      status: 'testing',
      apis: ['API 1', 'API 2', 'API 3'],
      executions: 0,
      successRate: 0
    };
    
    setWorkflows([...workflows, newWorkflow]);
    setInput('');
    setGenerating(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            API Automation Tool
          </h1>
          <p className="text-xl text-slate-300">
            Connect any API to any other API with natural language.
          </p>
        </div>

        {/* Create Workflow */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create Automation</h2>
          <p className="text-sm text-slate-400 mb-4">
            Describe your workflow in plain English. AI will generate the integration code.
          </p>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: When a new customer signs up in Stripe, create a user in Supabase, send welcome email via SendGrid, add to Slack channel, and create task in Linear."
            className="w-full h-32 rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/50 mb-4"
          />
          
          <div className="flex items-center gap-3">
            <button
              onClick={generateWorkflow}
              disabled={!input || generating}
              className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : '⚡ Generate Workflow'}
            </button>
            <span className="text-sm text-slate-400">
              Usually takes 30 seconds
            </span>
          </div>
        </div>

        {/* Example Workflows */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Example Workflows</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => setInput('When a new customer signs up in Stripe, create a user in Supabase and send welcome email via SendGrid')}
              className="rounded-lg border border-white/10 bg-slate-800/40 p-4 text-left hover:border-emerald-400/50 transition"
            >
              <p className="font-semibold text-white text-sm mb-1">New Customer Onboarding</p>
              <p className="text-xs text-slate-400">Stripe → Supabase → SendGrid</p>
            </button>
            <button
              onClick={() => setInput('When a support ticket is created in Zendesk, create a task in Linear and notify team in Slack')}
              className="rounded-lg border border-white/10 bg-slate-800/40 p-4 text-left hover:border-emerald-400/50 transition"
            >
              <p className="font-semibold text-white text-sm mb-1">Support Ticket Routing</p>
              <p className="text-xs text-slate-400">Zendesk → Linear → Slack</p>
            </button>
            <button
              onClick={() => setInput('When a new lead is added in HubSpot, enrich with Clearbit data and add to Salesforce')}
              className="rounded-lg border border-white/10 bg-slate-800/40 p-4 text-left hover:border-emerald-400/50 transition"
            >
              <p className="font-semibold text-white text-sm mb-1">Lead Enrichment</p>
              <p className="text-xs text-slate-400">HubSpot → Clearbit → Salesforce</p>
            </button>
            <button
              onClick={() => setInput('When a payment fails in Stripe, send notification via Twilio SMS and create alert in PagerDuty')}
              className="rounded-lg border border-white/10 bg-slate-800/40 p-4 text-left hover:border-emerald-400/50 transition"
            >
              <p className="font-semibold text-white text-sm mb-1">Payment Failure Alert</p>
              <p className="text-xs text-slate-400">Stripe → Twilio → PagerDuty</p>
            </button>
          </div>
        </div>

        {/* Active Workflows */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Workflows ({workflows.length})</h2>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        workflow.status === 'live' ? 'bg-emerald-500/20 text-emerald-300' :
                        workflow.status === 'testing' ? 'bg-yellow-500/20 text-yellow-300' :
                        workflow.status === 'error' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {workflow.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{workflow.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.apis.map((api, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{workflow.executions.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">executions</p>
                    <p className="text-sm text-emerald-400 mt-2">{workflow.successRate}% success</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 transition">
                    View Logs
                  </button>
                  <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 transition">
                    Edit
                  </button>
                  <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 transition">
                    Pause
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
          <h2 className="text-2xl font-bold text-emerald-200 mb-4">Pricing</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-1">Free</p>
              <p className="text-2xl font-bold text-white mb-2">£0</p>
              <p className="text-xs text-slate-400">100 API calls/month</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-1">Pro</p>
              <p className="text-2xl font-bold text-white mb-2">£50</p>
              <p className="text-xs text-slate-400">10k API calls/month</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-1">Business</p>
              <p className="text-2xl font-bold text-white mb-2">£200</p>
              <p className="text-xs text-slate-400">100k API calls/month</p>
            </div>
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-300 mb-1">Enterprise</p>
              <p className="text-2xl font-bold text-emerald-200 mb-2">£2k</p>
              <p className="text-xs text-emerald-300">Unlimited + white-label</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
