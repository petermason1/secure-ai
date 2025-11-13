'use client';

import { useState, useEffect } from 'react';

type Decision = {
  id: string;
  question: string;
  answer?: 'yes' | 'no';
  timestamp?: string;
  context?: string;
};

type ActionItem = {
  id: string;
  task: string;
  assignee: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
};

type MeetingState = 'pre' | 'active' | 'post';

export default function DecisionMeeting() {
  const [state, setState] = useState<MeetingState>('pre');
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Decision | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [meetingType, setMeetingType] = useState<'sales' | 'marketing' | 'management' | null>(null);

  // Simulate AI listening and generating questions
  useEffect(() => {
    if (state === 'active' && !currentQuestion) {
      // Simulate AI detecting decision point
      const timer = setTimeout(() => {
        generateQuestion();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state, currentQuestion]);

  function generateQuestion() {
    const questions = {
      sales: [
        "Client asked about pricing. Send £100k proposal?",
        "Schedule follow-up call in 3 days?",
        "Add discount for early payment?",
        "Include implementation support in proposal?"
      ],
      marketing: [
        "Campaign underperforming. Reallocate budget to LinkedIn?",
        "Increase social media spend by £5k?",
        "Launch new creative next week?",
        "Pause underperforming ads?"
      ],
      management: [
        "Team blocked on API. Hire contractor?",
        "Approve £10k budget for external help?",
        "Extend deadline by 1 week?",
        "Reassign resources from Project B?"
      ]
    };

    const typeQuestions = meetingType ? questions[meetingType] : questions.sales;
    const remainingQuestions = typeQuestions.filter(
      q => !decisions.some(d => d.question === q)
    );

    if (remainingQuestions.length > 0) {
      const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
      setCurrentQuestion({
        id: `decision-${Date.now()}`,
        question,
        context: `Based on current discussion`
      });
    }
  }

  function handleDecision(answer: 'yes' | 'no') {
    if (!currentQuestion) return;

    const decision: Decision = {
      ...currentQuestion,
      answer,
      timestamp: new Date().toISOString()
    };

    setDecisions([...decisions, decision]);
    setCurrentQuestion(null);

    // Generate action item if yes
    if (answer === 'yes') {
      const actionItem: ActionItem = {
        id: `action-${Date.now()}`,
        task: currentQuestion.question.replace('?', ''),
        assignee: 'AI Agent',
        status: 'pending'
      };
      setActionItems([...actionItems, actionItem]);
    }

    // Add to transcript
    setTranscript([
      ...transcript,
      `DECISION: ${currentQuestion.question} → ${answer.toUpperCase()}`
    ]);
  }

  function startMeeting(type: 'sales' | 'marketing' | 'management') {
    setMeetingType(type);
    setState('active');
    setTranscript([`Meeting started: ${type.toUpperCase()}`]);
  }

  function endMeeting() {
    setState('post');
    setTranscript([...transcript, `Meeting ended. ${decisions.length} decisions made.`]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            DECISION
          </h1>
          <p className="mt-2 text-slate-400">AI runs your meetings. You just say yes or no.</p>
        </div>

        {/* Pre-Meeting */}
        {state === 'pre' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Select Meeting Type</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <MeetingTypeCard
                icon="💼"
                title="Sales Meeting"
                description="Client calls, proposals, negotiations"
                onClick={() => startMeeting('sales')}
              />
              <MeetingTypeCard
                icon="📱"
                title="Marketing Meeting"
                description="Campaigns, budgets, creative review"
                onClick={() => startMeeting('marketing')}
              />
              <MeetingTypeCard
                icon="👥"
                title="Management Meeting"
                description="Team updates, blockers, priorities"
                onClick={() => startMeeting('management')}
              />
            </div>
          </div>
        )}

        {/* Active Meeting */}
        {state === 'active' && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Main Area */}
            <div className="space-y-6">
              {/* Current Decision */}
              {currentQuestion && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6 animate-in fade-in">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl">🤖</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-200">AI Decision Point</p>
                      <p className="mt-2 text-lg text-white">{currentQuestion.question}</p>
                      {currentQuestion.context && (
                        <p className="mt-2 text-sm text-slate-400">{currentQuestion.context}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecision('yes')}
                      className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleDecision('no')}
                      className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold hover:border-white/40"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Meeting Transcript</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcript.map((line, i) => (
                    <div key={i} className="text-sm text-slate-300 font-mono">
                      {line}
                    </div>
                  ))}
                  {transcript.length === 0 && (
                    <p className="text-slate-500 text-sm">AI is listening...</p>
                  )}
                </div>
              </div>

              <button
                onClick={endMeeting}
                className="w-full rounded-lg border border-rose-400/30 px-6 py-3 font-semibold text-rose-200 hover:bg-rose-500/10"
              >
                End Meeting
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Decisions Made */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Decisions ({decisions.length})</h3>
                <div className="space-y-3">
                  {decisions.map((d) => (
                    <div key={d.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
                      <div className="flex items-start gap-2">
                        <span className={`text-lg ${d.answer === 'yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {d.answer === 'yes' ? '✓' : '✕'}
                        </span>
                        <p className="flex-1 text-sm text-slate-300">{d.question}</p>
                      </div>
                    </div>
                  ))}
                  {decisions.length === 0 && (
                    <p className="text-slate-500 text-sm">No decisions yet</p>
                  )}
                </div>
              </div>

              {/* Action Items */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Action Items ({actionItems.length})</h3>
                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
                      <p className="text-sm font-semibold text-white">{item.task}</p>
                      <p className="mt-1 text-xs text-slate-400">Assigned: {item.assignee}</p>
                    </div>
                  ))}
                  {actionItems.length === 0 && (
                    <p className="text-slate-500 text-sm">No action items yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post-Meeting */}
        {state === 'post' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-emerald-200">Meeting Complete</h2>
              <p className="mt-2 text-slate-300">
                {decisions.length} decisions made • {actionItems.length} action items assigned
              </p>
            </div>

            {/* Summary */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Decisions Summary</h3>
                <div className="space-y-3">
                  {decisions.map((d) => (
                    <div key={d.id} className="flex items-start gap-3">
                      <span className={`text-xl ${d.answer === 'yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {d.answer === 'yes' ? '✓' : '✕'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{d.question}</p>
                        <p className="text-xs text-slate-500">{new Date(d.timestamp!).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold mb-4">Action Items</h3>
                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
                      <p className="text-sm font-semibold text-white">{item.task}</p>
                      <p className="mt-1 text-xs text-slate-400">→ {item.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setState('pre');
                  setDecisions([]);
                  setActionItems([]);
                  setTranscript([]);
                  setMeetingType(null);
                }}
                className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Start New Meeting
              </button>
              <button
                onClick={() => {
                  // Export summary
                  const summary = {
                    type: meetingType,
                    decisions,
                    actionItems,
                    transcript
                  };
                  console.log('Meeting Summary:', summary);
                  alert('Summary exported to console');
                }}
                className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold hover:border-white/40"
              >
                Export Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingTypeCard({ icon, title, description, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-slate-900/60 p-6 text-left transition hover:border-emerald-400/50 hover:bg-slate-900/80"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </button>
  );
}
