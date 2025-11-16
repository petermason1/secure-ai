'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateIdea } from '@idea-randomizer/core';

export default function ProjectIdeasPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState('monetization');

  const projectDescription = `Autonomous AI Company Builder Platform with:
- 15+ AI-powered departments (Psychology, Marketing, Sales, HR, Legal, etc.)
- Bot Activity HUD for monitoring AI agents
- Junior Dev Team, Senior Dev Team, Learning & Development bots
- Bot Hub for inter-agent communication
- Storage & Filing Department
- Post Team for message processing
- Media Team for press releases
- Health & Safety department
- Psychology research system (analyzing game shows, PPV events, concerts)
- Marketing and L&D processing workflows
- Bot avatars and missions system
- Scrum meetings, KANBAN boards, JIT bots
- Token management system
- Inter-department meetings
- Turso database backend
- Vercel AI Gateway integration
- Zero-setup philosophy`;

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ideas/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_description: projectDescription,
          focus_area: focusArea,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateQuickIdea = () => {
    const idea = generateIdea();
    setResults({
      success: true,
      generated_idea: idea,
      quick_idea: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-white mb-2">💡 Project Ideas Generator</h1>
        <p className="text-slate-400 mb-8">Run your project through the ideas generator for improvements, monetization, and new features</p>

        {/* Focus Area Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Focus Area
          </label>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white w-full md:w-64"
          >
            <option value="monetization">Monetization</option>
            <option value="features">New Features</option>
            <option value="marketing">Marketing Angles</option>
            <option value="positioning">Product Positioning</option>
            <option value="expansion">Expansion Ideas</option>
            <option value="improvement">General Improvement</option>
          </select>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? 'Analyzing...' : '🚀 Run Full Analysis'}
          </button>
          
          <button
            onClick={generateQuickIdea}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            ⚡ Generate Quick Idea
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="text-red-400 font-semibold">Error</div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Generated Idea */}
            {results.generated_idea && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">🎯 Generated Idea</h2>
                  {((results.generated_idea.headline?.toLowerCase().includes('wellbeing') && 
                     results.generated_idea.headline?.toLowerCase().includes('founder')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('commerce') && 
                     results.generated_idea.headline?.toLowerCase().includes('non-profit')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('commerce') && 
                     results.generated_idea.headline?.toLowerCase().includes('parent')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('fintech') && 
                     results.generated_idea.headline?.toLowerCase().includes('hustler')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('wellbeing') && 
                     results.generated_idea.headline?.toLowerCase().includes('learner')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('creator') && 
                     results.generated_idea.headline?.toLowerCase().includes('non-profit')) ||
                    (results.generated_idea.headline?.toLowerCase().includes('creator') && 
                     results.generated_idea.headline?.toLowerCase().includes('co-pilot'))) && (
                    <Link
                      href={
                        results.generated_idea.headline?.toLowerCase().includes('wellbeing') && 
                        results.generated_idea.headline?.toLowerCase().includes('founder')
                          ? "/projects/wellbeing-solo-founders"
                          : results.generated_idea.headline?.toLowerCase().includes('wellbeing') && 
                            results.generated_idea.headline?.toLowerCase().includes('learner')
                          ? "/projects/wellbeing-lifelong-learners"
                          : results.generated_idea.headline?.toLowerCase().includes('commerce') && 
                            results.generated_idea.headline?.toLowerCase().includes('non-profit')
                          ? "/projects/local-commerce-booster"
                          : results.generated_idea.headline?.toLowerCase().includes('commerce') && 
                            results.generated_idea.headline?.toLowerCase().includes('parent')
                          ? "/projects/commerce-booster-new-parents"
                          : results.generated_idea.headline?.toLowerCase().includes('fintech') && 
                            results.generated_idea.headline?.toLowerCase().includes('hustler')
                          ? "/projects/fintech-trust-layer"
                          : (results.generated_idea.headline?.toLowerCase().includes('creator') && 
                             results.generated_idea.headline?.toLowerCase().includes('non-profit')) ||
                            (results.generated_idea.headline?.toLowerCase().includes('creator') && 
                             results.generated_idea.headline?.toLowerCase().includes('co-pilot'))
                          ? "/projects/creator-economy-nonprofit"
                          : "/projects/fintech-trust-layer"
                      }
                      className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      View Enhanced Page →
                    </Link>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-emerald-400 font-semibold mb-1">Headline</div>
                    <div className="text-white">{results.generated_idea.headline}</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-semibold mb-1">Elevator Pitch</div>
                    <div className="text-slate-300 text-sm">{results.generated_idea.elevatorPitch}</div>
                  </div>
                  {results.generated_idea.talkingPoints && (
                    <div>
                      <div className="text-yellow-400 font-semibold mb-1">Talking Points</div>
                      <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                        {results.generated_idea.talkingPoints.map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Analysis */}
            {results.project_analysis && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">📊 Project Analysis</h2>
                <div className="bg-slate-900 rounded p-4 text-slate-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {results.project_analysis}
                </div>
              </div>
            )}

            {/* Project Summary */}
            {results.project_summary && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">📋 Project Summary</h2>
                <div className="bg-slate-900 rounded p-4 text-slate-300 text-sm whitespace-pre-wrap">
                  {results.project_summary}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📋 How It Works</h2>
          <ol className="list-decimal list-inside text-slate-300 space-y-2 text-sm">
            <li><strong>Full Analysis</strong>: AI analyzes your entire project and generates improvement ideas</li>
            <li><strong>Quick Idea</strong>: Instantly generates a random idea using the idea generator</li>
            <li><strong>Focus Areas</strong>: Choose what aspect to focus on (monetization, features, etc.)</li>
            <li><strong>Results</strong>: Get structured ideas and analysis for your project</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
