'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type CryptoBotPersonality = 
  | 'gordon-gekko' 
  | 'wolf-of-wall-street' 
  | 'dragons-den' 
  | 'warren-buffett'
  | 'jesse-livermore';

interface PersonalityInfo {
  name: string;
  description: string;
  style: string;
  riskLevel: string;
  catchphrases: string[];
}

export default function CryptoTradingPage() {
  const [personality, setPersonality] = useState<CryptoBotPersonality>('gordon-gekko');
  const [personalities, setPersonalities] = useState<Record<string, PersonalityInfo>>({});
  const [botCreated, setBotCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [signal, setSignal] = useState<{ signal: string; analysis: string } | null>(null);
  const [symbol, setSymbol] = useState('BTC');
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    loadPersonalities();
  }, []);

  const loadPersonalities = async () => {
    try {
      const res = await fetch('/api/crypto-bot/create');
      const data = await res.json();
      if (data.success) {
        setPersonalities(data.personalities || {});
        if (data.bot) {
          setPersonality(data.bot.personality);
          setBotCreated(true);
        }
      }
    } catch (error) {
      console.error('Failed to load personalities:', error);
    }
  };

  const createBot = async (selectedPersonality: CryptoBotPersonality) => {
    setLoading(true);
    try {
      const res = await fetch('/api/crypto-bot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: selectedPersonality }),
      });
      const data = await res.json();
      if (data.success) {
        setPersonality(selectedPersonality);
        setBotCreated(true);
        alert(`✅ ${data.bot.config.name} bot activated!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create bot'));
      }
    } catch (error) {
      alert('Error creating bot: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarket = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/crypto-bot/analyze-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, personality }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze market'));
      }
    } catch (error) {
      alert('Error analyzing market: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const generateSignal = async () => {
    setLoading(true);
    setSignal(null);
    try {
      const res = await fetch('/api/crypto-bot/trading-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, personality }),
      });
      const data = await res.json();
      if (data.success) {
        setSignal({ signal: data.signal, analysis: data.analysis });
      } else {
        alert('Error: ' + (data.error || 'Failed to generate signal'));
      }
    } catch (error) {
      alert('Error generating signal: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const currentPersonality = personalities[personality];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">💰 Crypto Trading Bot</h1>
          <p className="text-slate-300">
            Choose your trading personality and get AI-powered market analysis and trading signals
          </p>
        </div>

        {/* Personality Selector */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Choose Your Trading Personality</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(personalities).map(([key, info]) => (
              <button
                key={key}
                onClick={() => createBot(key as CryptoBotPersonality)}
                disabled={loading || personality === key}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  personality === key
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <h3 className="text-lg font-semibold text-white mb-1">{info.name}</h3>
                <p className="text-sm text-slate-300 mb-2">{info.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    info.riskLevel === 'extreme' ? 'bg-red-900 text-red-300' :
                    info.riskLevel === 'high' ? 'bg-orange-900 text-orange-300' :
                    info.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    Risk: {info.riskLevel.toUpperCase()}
                  </span>
                </div>
                {personality === key && (
                  <div className="text-xs text-emerald-400 mt-2">
                    ✓ Active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Personality Display */}
        {currentPersonality && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {currentPersonality.name} Mode
                </h2>
                <p className="text-slate-300 mb-2">{currentPersonality.style}</p>
                <div className="flex flex-wrap gap-2">
                  {currentPersonality.catchphrases?.slice(0, 3).map((phrase, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trading Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Trading Controls</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                placeholder="BTC"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={analyzeMarket}
              disabled={loading || !botCreated}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : '📊 Analyze Market'}
            </button>
            <button
              onClick={generateSignal}
              disabled={loading || !botCreated}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : '⚡ Get Trading Signal'}
            </button>
          </div>
        </div>

        {/* Market Analysis */}
        {analysis && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Market Analysis</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap">{analysis}</div>
            </div>
          </div>
        )}

        {/* Trading Signal */}
        {signal && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Signal</h2>
            <div className="mb-4">
              <span className={`text-2xl font-bold px-4 py-2 rounded ${
                signal.signal === 'BUY' ? 'bg-green-900 text-green-300' :
                signal.signal === 'SELL' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {signal.signal}
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap">{signal.analysis}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

