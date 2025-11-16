'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PersonalityInfo {
  name: string;
  description: string;
  style: string;
  focus: string[];
  audience: string[];
  catchphrases: string[];
  monetizationStrategy: string[];
}

export default function WellBeingTeamPage() {
  const [personalities, setPersonalities] = useState<Record<string, PersonalityInfo>>({});
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [contentType, setContentType] = useState('social-media-post');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const res = await fetch('/api/well-being-team/create');
      const data = await res.json();
      if (data.success) {
        setPersonalities(data.personalities || {});
        setBots(data.bots || []);
      }
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const createBot = async (personality: string) => {
    setCreating(personality);
    try {
      const res = await fetch('/api/well-being-team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality }),
      });
      const data = await res.json();
      if (data.success) {
        await loadTeam();
        alert(`✅ ${data.bot.config.name} activated!`);
        setSelectedPersonality(personality);
      } else {
        alert('Error: ' + (data.error || 'Failed to create bot'));
      }
    } catch (error) {
      alert('Error creating bot: ' + error);
    } finally {
      setCreating(null);
    }
  };

  const generateContent = async () => {
    if (!selectedPersonality) {
      alert('Please select a personality first');
      return;
    }
    if (!topic) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await fetch('/api/well-being-team/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: selectedPersonality,
          contentType,
          topic,
          targetAudience,
          length: 'medium',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.content);
      } else {
        alert('Error: ' + (data.error || 'Failed to generate content'));
      }
    } catch (error) {
      alert('Error generating content: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAudience = async () => {
    if (!selectedPersonality) {
      alert('Please select a personality first');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/well-being-team/analyze-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: selectedPersonality,
          platform: 'all',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Audience analysis complete! Check the response in console or create a display for it.');
        console.log('Audience Analysis:', data.analysis);
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze audience'));
      }
    } catch (error) {
      alert('Error analyzing audience: ' + error);
    } finally {
      setAnalyzing(false);
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
            🌟 Well Being Team
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            World-class motivational speakers and coaches to engage high-value audiences and drive monetization
          </p>
        </div>

        {/* Personality Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">Choose Your Motivational Speaker</h2>
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
                      ? 'border-yellow-500 bg-yellow-900/20'
                      : isActive
                      ? 'border-emerald-500 bg-emerald-900/20'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{info.name}</h3>
                    {isActive && (
                      <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{info.description}</p>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Target Audience:</p>
                    <div className="flex flex-wrap gap-1">
                      {info.audience.slice(0, 2).map((aud, i) => (
                        <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          {aud}
                        </span>
                      ))}
                      {info.audience.length > 2 && (
                        <span className="text-xs text-slate-500">+{info.audience.length - 2}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Monetization:</p>
                    <p className="text-xs text-yellow-400">{info.monetizationStrategy[0]}</p>
                  </div>

                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        createBot(key);
                      }}
                      disabled={creating === key}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {creating === key ? 'Activating...' : 'Activate Speaker'}
                    </button>
                  )}
                  
                  {isSelected && (
                    <div className="mt-2 text-xs text-yellow-400">
                      ✓ Selected for content generation
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Generation */}
        {currentPersonality && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Generate Content with {currentPersonality.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="social-media-post">Social Media Post</option>
                  <option value="video-script">Video Script</option>
                  <option value="blog-post">Blog Post</option>
                  <option value="email-newsletter">Email Newsletter</option>
                  <option value="motivational-speech">Motivational Speech</option>
                  <option value="course-outline">Course Outline</option>
                  <option value="sales-page">Sales Page</option>
                  <option value="podcast-script">Podcast Script</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Overcoming fear, Building wealth, Peak performance..."
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Target Audience (Optional)</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., High-net-worth entrepreneurs, Career changers..."
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={generateContent}
                  disabled={loading || !topic}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generating...' : '✨ Generate Content'}
                </button>
                <button
                  onClick={analyzeAudience}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  {analyzing ? 'Analyzing...' : '📊 Analyze Audience'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Generated Content</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  alert('Content copied to clipboard!');
                }}
                className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded"
              >
                Copy
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                {generatedContent}
              </div>
            </div>
          </div>
        )}

        {/* Personality Info */}
        {currentPersonality && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">About {currentPersonality.name}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Style</p>
                <p className="text-slate-300">{currentPersonality.style}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {currentPersonality.focus.map((f, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Signature Catchphrases</p>
                <div className="space-y-1">
                  {currentPersonality.catchphrases.map((phrase, i) => (
                    <p key={i} className="text-sm text-yellow-400 italic">"{phrase}"</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Monetization Strategies</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentPersonality.monetizationStrategy.map((strategy, i) => (
                    <li key={i} className="text-sm text-slate-300">{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

