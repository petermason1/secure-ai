'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAvatarForBot } from '@/lib/bot-avatars';

interface LDBot {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  background?: string;
  expertise?: string;
  created_at: string;
  avatar?: string;
  effortScore?: number;
  recentActivity?: number;
}

type FilterType = 'all' | 'phd' | 'sales' | 'self-taught' | 'random';
type SortType = 'name' | 'recent' | 'effort' | 'created';

export default function LearningDevTeamPage() {
  const [bots, setBots] = useState<LDBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('name');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedBot, setSelectedBot] = useState<LDBot | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadBots();
    loadFavorites();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadBots();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('ld-team-favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  const loadFavorites = () => {
    const stored = localStorage.getItem('ld-team-favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  };

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('ld-team-favorites', JSON.stringify(Array.from(newFavorites)));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (botId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(botId)) {
      newFavorites.delete(botId);
    } else {
      newFavorites.add(botId);
    }
    saveFavorites(newFavorites);
  };

  const loadBots = async () => {
    try {
      const res = await fetch('/api/learning-dev-team/list');
      const data = await res.json();
      if (data.success) {
        // Add avatars and fetch effort metrics
        const botsWithAvatars = await Promise.all(
          (data.agents || []).map(async (bot: LDBot) => {
            const avatar = getAvatarForBot(bot.name, 'learning', bot.expertise);
            
            // Try to fetch effort metrics
            let effortScore = 0;
            let recentActivity = 0;
            try {
              const effortRes = await fetch(`/api/bots/effort/metrics?botId=${bot.id}`);
              const effortData = await effortRes.json();
              if (effortData.success && effortData.metrics) {
                effortScore = effortData.metrics.currentEffortScore || 0;
                recentActivity = effortData.metrics.recentActivityCount || 0;
              }
            } catch (e) {
              // Effort metrics not available, use defaults
            }

            return {
              ...bot,
              avatar,
              effortScore,
              recentActivity,
            };
          })
        );
        setBots(botsWithAvatars);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/learning-dev-team/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadBots();
        alert(`✅ Created ${data.agents.length} L&D bots with diverse backgrounds!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to create team'));
      }
    } catch (error) {
      alert('Error creating team: ' + error);
    } finally {
      setCreating(false);
    }
  };

  const filteredAndSortedBots = bots
    .filter((bot) => {
      // Search filter
      if (search && !bot.name.toLowerCase().includes(search.toLowerCase()) &&
          !bot.expertise?.toLowerCase().includes(search.toLowerCase()) &&
          !bot.background?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filter === 'phd') {
        return bot.name.toLowerCase().includes('phd') || bot.background?.toLowerCase().includes('phd');
      }
      if (filter === 'sales') {
        return bot.name.toLowerCase().includes('sales') || bot.background?.toLowerCase().includes('sales');
      }
      if (filter === 'self-taught') {
        return bot.name.toLowerCase().includes('self-taught') || bot.background?.toLowerCase().includes('self-taught');
      }
      if (filter === 'random') {
        return bot.name.toLowerCase().includes('random');
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'effort') return (b.effortScore || 0) - (a.effortScore || 0);
      if (sort === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'recent') return (b.recentActivity || 0) - (a.recentActivity || 0);
      return 0;
    })
    .sort((a, b) => {
      // Favorites first
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            <p className="mt-4 text-slate-300">Loading L&D Team...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/bot-activity-hud" 
            className="text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Bot Activity HUD
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                🎓 Learning & Development Team
              </h1>
              <p className="text-slate-300 text-sm md:text-base">
                Diverse team of experts: PhD Statistics, PhD CS, Self-Taught, Sales Expert, and Random
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
                <span className="ml-2 inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              </p>
            </div>
            <button
              onClick={createTeam}
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              {creating ? 'Creating...' : '🚀 Create L&D Team'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        {bots.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 mb-6 border border-slate-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bots by name, expertise, or background..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'phd', 'sales', 'self-taught', 'random'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
              >
                <option value="name">Sort: Name</option>
                <option value="effort">Sort: Effort Score</option>
                <option value="recent">Sort: Recent Activity</option>
                <option value="created">Sort: Newest</option>
              </select>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        {bots.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{bots.length}</div>
              <div className="text-sm text-slate-400">Total Bots</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-emerald-400">
                {bots.filter(b => b.status === 'active').length}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(bots.reduce((sum, b) => sum + (b.effortScore || 0), 0) / bots.length) || 0}
              </div>
              <div className="text-sm text-slate-400">Avg Effort</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-yellow-400">
                {bots.reduce((sum, b) => sum + (b.recentActivity || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Recent Activity</div>
            </div>
          </div>
        )}

        {/* Bot Grid */}
        {bots.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 md:p-12 text-center border border-slate-700/50">
            <div className="text-6xl mb-4">🎓</div>
            <p className="text-slate-300 mb-4 text-lg">No L&D bots created yet.</p>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Create your Learning & Development team with diverse backgrounds and expertise.
            </p>
            <button
              onClick={createTeam}
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              {creating ? 'Creating...' : '🚀 Create L&D Team'}
            </button>
          </div>
        ) : filteredAndSortedBots.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 text-center border border-slate-700/50">
            <p className="text-slate-300">No bots match your filters.</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearch('');
              }}
              className="mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedBots.map((bot) => (
              <div
                key={bot.id}
                onClick={() => setSelectedBot(bot)}
                className={`group relative bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border transition-all cursor-pointer hover:scale-105 ${
                  favorites.has(bot.id)
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                    : 'border-slate-700/50 hover:border-emerald-500/50'
                }`}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(bot.id);
                  }}
                  className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform z-10"
                  title={favorites.has(bot.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(bot.id) ? '⭐' : '☆'}
                </button>

                {/* Avatar and Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{bot.avatar || '🤖'}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">
                      {bot.name}
                    </h3>
                    {bot.background && (
                      <div className="text-xs text-emerald-400 mb-2 font-medium">{bot.background}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        bot.status === 'active'
                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {bot.status}
                      </span>
                      {bot.recentActivity && bot.recentActivity > 0 && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                          {bot.recentActivity} recent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                {bot.expertise && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-1">Expertise</p>
                    <p className="text-sm text-slate-300 line-clamp-2">{bot.expertise}</p>
                  </div>
                )}

                {/* Effort Score */}
                {bot.effortScore !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Effort Score</span>
                      <span className="text-emerald-400 font-semibold">{bot.effortScore}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((bot.effortScore || 0) / 10 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {bot.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded border border-slate-600/50"
                      >
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {bot.capabilities.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{bot.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                  Created: {new Date(bot.created_at).toLocaleDateString()}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 whitespace-nowrap">
                    Click to view details
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bot Detail Modal */}
        {selectedBot && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBot(null)}
          >
            <div
              className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedBot.avatar || '🤖'}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedBot.name}</h2>
                    {selectedBot.background && (
                      <p className="text-emerald-400 text-sm">{selectedBot.background}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBot(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedBot.expertise && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Expertise</h3>
                  <p className="text-slate-300">{selectedBot.expertise}</p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">All Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBot.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                    >
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Created: {new Date(selectedBot.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
