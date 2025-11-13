'use client';

import { useState } from 'react';

type Agent = 'sales' | 'marketing' | 'security' | 'cloud';

type AgentResponse = {
  agent: Agent;
  response: string;
  recommendation?: 'approve' | 'defer' | 'reject';
};

type Decision = {
  id: string;
  topic: string;
  question: string;
  agentResponses: AgentResponse[];
  humanDecision?: 'yes' | 'no';
  actionItems?: string[];
  timestamp?: string;
};

type MeetingAgenda = {
  title: string;
  items: {
    topic: string;
    question: string;
    context: string;
  }[];
};

const AGENT_PROFILES = {
  sales: {
    name: 'Sales Agent',
    icon: '💼',
    color: 'emerald',
    focus: 'Revenue potential, market demand, deal pipeline'
  },
  marketing: {
    name: 'Marketing Agent',
    icon: '📱',
    color: 'blue',
    focus: 'SEO opportunity, content strategy, viral potential'
  },
  security: {
    name: 'Security Agent',
    icon: '🔒',
    color: 'rose',
    focus: 'Risk assessment, compliance, data protection'
  },
  cloud: {
    name: 'Cloud Agent',
    icon: '☁️',
    color: 'purple',
    focus: 'Infrastructure cost, scalability, deployment'
  }
};

export default function AIAgentMeeting() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [agenda] = useState<MeetingAgenda>({
    title: 'Global Documentation Strategy Review',
    items: [
      {
        topic: 'DocuMerge AI',
        question: 'Should we pursue DocuMerge AI? (Merges docs from multiple sources, £100k enterprise)',
        context: 'Enterprise customers frequently request unified documentation across tools.'
      },
      {
        topic: 'Migration-as-a-Service',
        question: 'Should we pursue Migration-as-a-Service? (AI automates code migrations, £100k per migration)',
        context: 'Every company has legacy code. Market size: 100M+ lines of legacy code globally.'
      },
      {
        topic: 'Ask Jeeves Enterprise',
        question: 'Should we accelerate Ask Jeeves (Cross-Platform Search)? (£100k enterprise)',
        context: 'Already in roadmap. Documentation analysis shows strong pattern match.'
      }
    ]
  });

  function startMeeting() {
    setMeetingStarted(true);
    setCurrentAgent('sales');
  }

  function generateAgentResponse(agent: Agent, item: typeof agenda.items[0]): AgentResponse {
    const responses = {
      sales: {
        'DocuMerge AI': {
          response: 'Strong demand. Enterprise customers ask for this constantly. Estimated 50 deals in Year 1 = £5M revenue. High confidence.',
          recommendation: 'approve' as const
        },
        'Migration-as-a-Service': {
          response: 'Huge market. Every company has legacy code. Estimated 100 migrations in Year 1 = £10M revenue. Highest priority.',
          recommendation: 'approve' as const
        },
        'Ask Jeeves Enterprise': {
          response: 'Already validated. Current pipeline has 20 interested prospects. Accelerating will close deals faster. £5M Year 1.',
          recommendation: 'approve' as const
        }
      },
      marketing: {
        'DocuMerge AI': {
          response: 'SEO opportunity: "unified documentation" gets 10k searches/month. Can rank #1 in 3 months. Content strategy ready.',
          recommendation: 'approve' as const
        },
        'Migration-as-a-Service': {
          response: 'Content angle: "How We Migrated 1M Lines of Code in 1 Week". Viral potential: High. Can drive inbound leads.',
          recommendation: 'approve' as const
        },
        'Ask Jeeves Enterprise': {
          response: 'Strong positioning: "Google for your company". Messaging is clear. Ready to launch campaign immediately.',
          recommendation: 'approve' as const
        }
      },
      security: {
        'DocuMerge AI': {
          response: 'Risk: Accessing customer docs requires strict security. Need: SOC 2, encryption, audit logs. 3 months to implement.',
          recommendation: 'defer' as const
        },
        'Migration-as-a-Service': {
          response: 'Risk: Accessing customer code. Need: Code scanning, vulnerability detection, secure transfer. High complexity. 6 months.',
          recommendation: 'defer' as const
        },
        'Ask Jeeves Enterprise': {
          response: 'High complexity. Need OAuth for all integrations. Security spec already drafted. 4 months to production-ready.',
          recommendation: 'approve' as const
        }
      },
      cloud: {
        'DocuMerge AI': {
          response: 'Feasible. Can deploy on AWS/GCP. Estimated cost: £50k/year infrastructure. Scalable to 1000+ customers.',
          recommendation: 'approve' as const
        },
        'Migration-as-a-Service': {
          response: 'Complex. Requires GPU for large codebases. Estimated cost: £200k/year infrastructure. Need 2 months setup.',
          recommendation: 'approve' as const
        },
        'Ask Jeeves Enterprise': {
          response: 'Requires vector database, real-time indexing. Cost: £100k/year. Architecture ready. Can deploy in 1 month.',
          recommendation: 'approve' as const
        }
      }
    };

    return {
      agent,
      ...responses[agent][item.topic as keyof typeof responses.sales]
    };
  }

  function nextAgent() {
    const agents: Agent[] = ['sales', 'marketing', 'security', 'cloud'];
    const currentIndex = agents.indexOf(currentAgent!);
    
    if (currentIndex < agents.length - 1) {
      setCurrentAgent(agents[currentIndex + 1]);
    } else {
      // All agents have spoken, wait for human decision
      setCurrentAgent(null);
    }
  }

  function makeDecision(answer: 'yes' | 'no') {
    const item = agenda.items[currentItem];
    const agentResponses = (['sales', 'marketing', 'security', 'cloud'] as Agent[]).map(agent =>
      generateAgentResponse(agent, item)
    );

    const decision: Decision = {
      id: `decision-${Date.now()}`,
      topic: item.topic,
      question: item.question,
      agentResponses,
      humanDecision: answer,
      actionItems: answer === 'yes' ? generateActionItems(item.topic) : [],
      timestamp: new Date().toISOString()
    };

    setDecisions([...decisions, decision]);

    if (currentItem < agenda.items.length - 1) {
      setCurrentItem(currentItem + 1);
      setCurrentAgent('sales');
    } else {
      // Meeting complete
      setMeetingStarted(false);
    }
  }

  function generateActionItems(topic: string): string[] {
    const actions = {
      'DocuMerge AI': [
        'Sales: Create pitch deck for DocuMerge AI',
        'Marketing: Launch SEO campaign for "unified documentation"',
        'Security: Draft SOC 2 compliance spec',
        'Cloud: Design AWS architecture'
      ],
      'Migration-as-a-Service': [
        'Sales: Identify 10 pilot customers',
        'Marketing: Create "1M lines migrated" case study',
        'Security: Implement code scanning',
        'Cloud: Provision GPU infrastructure'
      ],
      'Ask Jeeves Enterprise': [
        'Sales: Update pitch deck with documentation insights',
        'Marketing: Update messaging to "Google for your company"',
        'Security: Complete OAuth implementation',
        'Cloud: Set up vector database'
      ]
    };
    return actions[topic as keyof typeof actions] || [];
  }

  if (!meetingStarted && decisions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              AI AGENT MEETING
            </h1>
            <p className="mt-2 text-slate-400">Multi-department decision coordination</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8">
            <h2 className="text-2xl font-semibold mb-4">{agenda.title}</h2>
            <p className="text-slate-300 mb-6">
              {agenda.items.length} agenda items • 4 AI agents • Yes/No decisions
            </p>

            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {Object.entries(AGENT_PROFILES).map(([key, profile]) => (
                <div key={key} className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{profile.icon}</span>
                    <span className="font-semibold">{profile.name}</span>
                  </div>
                  <p className="text-sm text-slate-400">{profile.focus}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startMeeting}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Start Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meetingStarted && decisions.length > 0) {
    // Meeting complete
    const approved = decisions.filter(d => d.humanDecision === 'yes');
    const deferred = decisions.filter(d => d.humanDecision === 'no');
    const allActionItems = approved.flatMap(d => d.actionItems || []);

    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              MEETING COMPLETE
            </h1>
            <p className="mt-2 text-slate-400">
              {decisions.length} decisions made • {approved.length} approved • {deferred.length} deferred
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <h3 className="text-lg font-semibold text-emerald-200 mb-4">
                ✓ Approved ({approved.length})
              </h3>
              <div className="space-y-3">
                {approved.map(d => (
                  <div key={d.id} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <p className="font-semibold text-white">{d.topic}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {d.actionItems?.length || 0} action items assigned
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">
                Deferred ({deferred.length})
              </h3>
              <div className="space-y-3">
                {deferred.map(d => (
                  <div key={d.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
                    <p className="font-semibold text-white">{d.topic}</p>
                    <p className="text-sm text-slate-400 mt-1">Revisit in Q2</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Action Items ({allActionItems.length})</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {allActionItems.map((item, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setDecisions([]);
              setCurrentItem(0);
              setCurrentAgent(null);
            }}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            Start New Meeting
          </button>
        </div>
      </div>
    );
  }

  // Meeting in progress
  const item = agenda.items[currentItem];
  const agentProfile = currentAgent ? AGENT_PROFILES[currentAgent] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {agenda.title}
          </h1>
          <p className="mt-2 text-slate-400">
            Item {currentItem + 1} of {agenda.items.length}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {/* Current Topic */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-semibold mb-2">{item.topic}</h2>
              <p className="text-slate-300 mb-4">{item.context}</p>
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="font-semibold text-emerald-200">{item.question}</p>
              </div>
            </div>

            {/* Agent Speaking */}
            {currentAgent && agentProfile && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 animate-in fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{agentProfile.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{agentProfile.name}</p>
                    <p className="text-sm text-slate-400">{agentProfile.focus}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-800/40 p-4">
                  <p className="text-slate-200">{generateAgentResponse(currentAgent, item).response}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-400">Recommendation:</span>
                    <span className={`text-sm font-semibold ${
                      generateAgentResponse(currentAgent, item).recommendation === 'approve' ? 'text-emerald-400' :
                      generateAgentResponse(currentAgent, item).recommendation === 'defer' ? 'text-yellow-400' :
                      'text-rose-400'
                    }`}>
                      {generateAgentResponse(currentAgent, item).recommendation?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={nextAgent}
                  className="mt-4 w-full rounded-lg border border-white/20 px-4 py-2 font-semibold hover:border-white/40"
                >
                  Next Agent
                </button>
              </div>
            )}

            {/* Human Decision */}
            {!currentAgent && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6 animate-in fade-in">
                <p className="text-lg font-semibold text-emerald-200 mb-4">
                  All agents have spoken. Your decision?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => makeDecision('yes')}
                    className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
                  >
                    Yes - Approve
                  </button>
                  <button
                    onClick={() => makeDecision('no')}
                    className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold hover:border-white/40"
                  >
                    No - Defer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="space-y-3">
                {agenda.items.map((agendaItem, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${
                    i === currentItem ? 'border-emerald-400/50 bg-emerald-500/10' :
                    i < currentItem ? 'border-white/10 bg-slate-800/40' :
                    'border-white/10 bg-slate-800/20'
                  }`}>
                    <p className="text-sm font-semibold text-white">{agendaItem.topic}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {i < currentItem ? '✓ Decided' : i === currentItem ? 'In progress' : 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions Made */}
            {decisions.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Decisions ({decisions.length})</h3>
                <div className="space-y-2">
                  {decisions.map(d => (
                    <div key={d.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${d.humanDecision === 'yes' ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {d.humanDecision === 'yes' ? '✓' : '—'}
                        </span>
                        <p className="text-sm text-slate-300">{d.topic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
