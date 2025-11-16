'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PokemonBotCard } from '@/app/components/bot-hud/PokemonBotCard';

interface Bot {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  specialty?: string;
  effort_metrics?: {
    effort_score: number;
    priority_boost: number;
    focus_boost: number;
    total_hours: number;
    resources: number;
  };
}

export default function PokemonBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState('free');
  const [showShop, setShowShop] = useState(false);
  const [reviews, setReviews] = useState<any>(null);

  useEffect(() => {
    loadBots();
    checkTier();
  }, []);

  const loadBots = async () => {
    try {
      const res = await fetch('/api/junior-dev-team/list');
      const data = await res.json();
      if (data.success) {
        const botsWithMetrics = await Promise.all(
          data.agents.map(async (bot: any) => {
            try {
              const metricsRes = await fetch(`/api/bots/effort/metrics?agent_id=${bot.id}&period=week`);
              const metricsData = await metricsRes.json();
              return {
                ...bot,
                effort_metrics: metricsData.totals ? {
                  effort_score: metricsData.totals.avg_effort_score || 0,
                  priority_boost: metricsData.totals.avg_priority || 0,
                  focus_boost: 50,
                  total_hours: metricsData.totals.total_hours || 0,
                  resources: metricsData.totals.total_resources || 0,
                } : undefined,
              };
            } catch {
              return bot;
            }
          })
        );
        setBots(botsWithMetrics);
      }
    } catch (err) {
      console.error('Failed to load bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkTier = async () => {
    try {
      const res = await fetch('/api/monetization/pokemon-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_limits', tier: 'free' }),
      });
      const data = await res.json();
      if (data.success) {
        setUserTier(data.tier);
      }
    } catch (err) {
      console.error('Failed to check tier:', err);
    }
  };

  const runReviews = async () => {
    try {
      const res = await fetch('/api/workflows/review-pokemon-system', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to run reviews:', err);
    }
  };

  const purchaseCardPack = async () => {
    try {
      const res = await fetch('/api/monetization/pokemon-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase_card_pack', purchase_type: 'card_pack' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Card pack purchased! Got ${data.cards.length} cards.`);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">⚡ Pokemon Bot Cards</h1>
            <p className="text-slate-400">Collect, trade, and battle with your AI bots!</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={runReviews}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              🔍 Run Reviews
            </button>
            <button
              onClick={() => setShowShop(!showShop)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              🛒 Shop
            </button>
          </div>
        </div>

        {reviews && (
          <div className="mb-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📋 System Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded p-4">
                <div className="text-blue-400 font-semibold mb-2">L&D Review</div>
                <div className="text-slate-300 text-sm line-clamp-4">
                  {reviews.reviews?.learning_development?.review?.substring(0, 200)}...
                </div>
              </div>
              <div className="bg-slate-900 rounded p-4">
                <div className="text-red-400 font-semibold mb-2">Security Review</div>
                <div className="text-slate-300 text-sm line-clamp-4">
                  {reviews.reviews?.security?.review?.substring(0, 200)}...
                </div>
              </div>
            </div>
            {reviews.monetization && (
              <div className="mt-4 bg-emerald-900/20 rounded p-4 border border-emerald-500/30">
                <div className="text-emerald-400 font-semibold mb-2">💰 Monetization Strategy</div>
                <div className="text-slate-300 text-sm">
                  Tiers: Free (£0), Starter (£10), Pro (£30), Enterprise (£100)
                </div>
                <div className="text-slate-300 text-sm mt-1">
                  Additional: Card Packs (£5), Power-ups (£2-15), Evolution Stones (£15)
                </div>
              </div>
            )}
          </div>
        )}

        {showShop && (
          <div className="mb-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">🛒 Card Shop</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-lg font-bold text-white mb-2">Card Pack</div>
                <div className="text-slate-400 text-sm mb-3">5 random bot cards</div>
                <div className="text-2xl font-bold text-emerald-400 mb-3">£5</div>
                <button
                  onClick={purchaseCardPack}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Buy Pack
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-lg font-bold text-white mb-2">Power-Up</div>
                <div className="text-slate-400 text-sm mb-3">Temporary boost</div>
                <div className="text-2xl font-bold text-yellow-400 mb-3">£2-10</div>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold">
                  Buy Power-Up
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-lg font-bold text-white mb-2">Evolution Stone</div>
                <div className="text-slate-400 text-sm mb-3">Evolve your bot</div>
                <div className="text-2xl font-bold text-purple-400 mb-3">£15</div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold">
                  Buy Stone
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading bot collection...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bots.map((bot) => (
              <PokemonBotCard
                key={bot.id}
                bot={bot}
                onActivatePower={(botId, power) => {
                  alert(`Activating ${power} for bot ${botId}`);
                }}
                onLevelUp={(botId) => {
                  alert(`Leveling up bot ${botId}`);
                }}
                onTrade={(botId) => {
                  alert(`Trading bot ${botId}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
