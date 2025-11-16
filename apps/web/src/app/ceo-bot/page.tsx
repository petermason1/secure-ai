'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CEOPersonalityInfo {
  name: string;
  company: string;
  era: string;
  description: string;
  style: string;
  decisionMaking: string[];
  focus: string[];
  catchphrases: string[];
  validationMethod: string;
}

export default function CEOBotPage() {
  const [personalities, setPersonalities] = useState<Record<string, CEOPersonalityInfo>>({});
  const [bots, setBots] = useState<any[]>([]);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [decision, setDecision] = useState('');
  const [context, setContext] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [decisionResult, setDecisionResult] = useState<any>(null);

  useEffect(() => {
    loadCEOs();
  }, []);

  const loadCEOs = async () => {
    try {
      const res = await fetch('/api/ceo-bot/create');
      const data = await res.json();
      if (data.success) {
        setPersonalities(data.personalities || {});
        setBots(data.bots || []);
        if (data.bots && data.bots.length > 0) {
          setSelectedPersonality(data.bots[0].personality);
        }
      }
    } catch (error) {
      console.error('Failed to load CEOs:', error);
    }
  };

  const createBot = async (personality: string) => {
    setCreating(personality);
    try {
      const res = await fetch('/api/ceo-bot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality }),
      });
      const data = await res.json();
      if (data.success) {
        await loadCEOs();
        setSelectedPersonality(personality);
        alert(`✅ ${data.bot.config.name} activated!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create bot'));
      }
    } catch (error) {
      alert('Error creating bot: ' + error);
    } finally {
      setCreating(null);
    }
  };

  const makeDecision = async () => {
    if (!selectedPersonality) {
      alert('Please select a CEO first');
      return;
    }
    if (!decision) {
      alert('Please enter a decision to make');
      return;
    }

    setLoading(true);
    setDecisionResult(null);
    try {
      const res = await fetch('/api/ceo-bot/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: selectedPersonality,
          decision,
          context,
          urgency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDecisionResult(data);
      } else {
        alert('Error: ' + (data.error || 'Failed to make decision'));
      }
    } catch (error) {
      alert('Error making decision: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const currentPersonality = selectedPersonality ? personalities[selectedPersonality] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            👔 CEO Bot - Top 10 CEOs in History
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Get strategic decisions from the world's greatest CEOs with quick validation outputs
          </p>
        </div>

        {/* CEO Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">Choose Your CEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(personalities).map(([key, info]) => {
              const isActive = bots.some(b => b.personality === key);
              const isSelected = selectedPersonality === key;
              
              return (
                <div
                  key={key}
                  onClick={() => setSelectedPersonality(key)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-900/20'
                      : isActive
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{info.name}</h3>
                      <p className="text-xs text-slate-400">{info.company} • {info.era}</p>
                    </div>
                    {isActive && (
                      <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{info.description}</p>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Validation Method:</p>
                    <p className="text-xs text-purple-400">{info.validationMethod}</p>
                  </div>

                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        createBot(key);
                      }}
                      disabled={creating === key}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {creating === key ? 'Activating...' : 'Activate CEO'}
                    </button>
                  )}
                  
                  {isSelected && (
                    <div className="mt-2 text-xs text-purple-400">
                      ✓ Selected for decisions
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Decision Interface */}
        {currentPersonality && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Make a Decision with {currentPersonality.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Decision Needed</label>
                <textarea
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="e.g., Should we launch this new product? Should we enter this market? Should we acquire this company?"
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Context (Optional)</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Provide additional context, data, or background information..."
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="low">Low - Strategic planning</option>
                  <option value="medium">Medium - Normal priority</option>
                  <option value="high">High - Urgent decision needed</option>
                  <option value="critical">Critical - Immediate action required</option>
                </select>
              </div>

              <button
                onClick={makeDecision}
                disabled={loading || !decision}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Making Decision...' : `👔 Get ${currentPersonality.name}'s Decision`}
              </button>
            </div>
          </div>
        )}

        {/* Decision Result */}
        {decisionResult && (
          <div className="space-y-4">
            {/* Decision */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Decision</h2>
                <span className="text-xs text-slate-400">{decisionResult.personality} • {decisionResult.company}</span>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-blue-300">{decisionResult.decision}</p>
              </div>
              
              {decisionResult.rationale && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Rationale</h3>
                  <p className="text-slate-300 whitespace-pre-wrap">{decisionResult.rationale}</p>
                </div>
              )}
            </div>

            {/* Quick Validation */}
            {decisionResult.quickValidation && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">⚡ Quick Validation</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <p className="text-slate-300 whitespace-pre-wrap">{decisionResult.quickValidation}</p>
                </div>
                
                {decisionResult.validationScript && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-400">Validation Script</h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(decisionResult.validationScript);
                          alert('Script copied to clipboard!');
                        }}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{decisionResult.validationScript}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Plan */}
            {decisionResult.actionPlan && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">📋 Action Plan</h2>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-300 whitespace-pre-wrap">{decisionResult.actionPlan}</p>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            {decisionResult.riskAssessment && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">⚠️ Risk Assessment</h2>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-300 whitespace-pre-wrap">{decisionResult.riskAssessment}</p>
                </div>
              </div>
            )}

            {/* Expected Outcome */}
            {decisionResult.expectedOutcome && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">🎯 Expected Outcome</h2>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-300 whitespace-pre-wrap">{decisionResult.expectedOutcome}</p>
                </div>
              </div>
            )}

            {/* Full Response */}
            <details className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <summary className="text-sm font-semibold text-slate-400 cursor-pointer">
                View Full Response
              </summary>
              <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                <pre className="text-slate-300 whitespace-pre-wrap text-sm">
                  {decisionResult.fullResponse}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* CEO Info */}
        {currentPersonality && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">About {currentPersonality.name}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Style</p>
                <p className="text-slate-300">{currentPersonality.style}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-2">Decision-Making Approach</p>
                <div className="flex flex-wrap gap-2">
                  {currentPersonality.decisionMaking.map((d, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Signature Quotes</p>
                <div className="space-y-1">
                  {currentPersonality.catchphrases.map((quote, i) => (
                    <p key={i} className="text-sm text-purple-400 italic">"{quote}"</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

