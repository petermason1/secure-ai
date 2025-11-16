'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Podcast {
  id: string;
  name: string;
  description?: string;
  host?: string;
  episode_count: number;
  transcript_count: number;
  thumbnail_url?: string;
  status: string;
}

interface Episode {
  id: string;
  title: string;
  guest_name?: string;
  published_date?: string;
  status: string;
  has_transcript: boolean;
  insight_count: number;
}

interface Trend {
  id: string;
  trend_name: string;
  description?: string;
  category?: string;
  mention_count: number;
  sentiment?: string;
}

interface BusinessIdea {
  id: string;
  idea_title: string;
  idea_description: string;
  market_category?: string;
  episode_id: string;
}

export default function PodcastIntelligencePage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [activeTab, setActiveTab] = useState<'podcasts' | 'episodes' | 'trends' | 'ideas'>('podcasts');
  const [loading, setLoading] = useState(false);
  const [showAddPodcast, setShowAddPodcast] = useState(false);
  const [newPodcast, setNewPodcast] = useState({
    name: '',
    description: '',
    host: '',
    rss_feed_url: '',
    youtube_channel_id: '',
    website_url: '',
  });

  useEffect(() => {
    loadPodcasts();
    loadTrends();
    loadBusinessIdeas();
  }, []);

  useEffect(() => {
    if (selectedPodcast) {
      loadEpisodes(selectedPodcast);
    }
  }, [selectedPodcast]);

  const loadPodcasts = async () => {
    try {
      const response = await fetch('/api/podcast-intelligence/list');
      const data = await response.json();
      if (data.success) {
        setPodcasts(data.podcasts || []);
      }
    } catch (error) {
      console.error('Failed to load podcasts:', error);
    }
  };

  const loadEpisodes = async (podcastId: string) => {
    try {
      const response = await fetch(`/api/podcast-intelligence/episodes?podcast_id=${podcastId}`);
      const data = await response.json();
      if (data.success) {
        setEpisodes(data.episodes || []);
      }
    } catch (error) {
      console.error('Failed to load episodes:', error);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await fetch('/api/podcast-intelligence/trends?limit=20');
      const data = await response.json();
      if (data.success) {
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const loadBusinessIdeas = async () => {
    try {
      const response = await fetch('/api/podcast-intelligence/business-ideas?limit=20');
      const data = await response.json();
      if (data.success) {
        setBusinessIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('Failed to load business ideas:', error);
    }
  };

  const handleAddPodcast = async () => {
    if (!newPodcast.name.trim()) {
      alert('Podcast name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/podcast-intelligence/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPodcast),
      });

      const data = await response.json();
      if (data.success) {
        alert('Podcast added successfully!');
        setShowAddPodcast(false);
        setNewPodcast({ name: '', description: '', host: '', rss_feed_url: '', youtube_channel_id: '', website_url: '' });
        await loadPodcasts();
      } else {
        alert('Error: ' + (data.error || 'Failed to add podcast'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEpisode = async (episodeId: string) => {
    if (!confirm('Analyze this episode? This will extract trends, expert opinions, and business ideas.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/podcast-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode_id: episodeId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Analysis complete! Found ${data.insights.trends} trends, ${data.insights.expert_opinions} expert opinions, and ${data.insights.business_ideas} business ideas.`);
        await loadEpisodes(selectedPodcast!);
        await loadTrends();
        await loadBusinessIdeas();
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze episode'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            🎙️ Podcast Intelligence Suite
          </h1>
          <p className="text-xl text-slate-300">
            Ingest, transcribe, and analyze podcasts to extract trends, expert opinions, and business ideas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['podcasts', 'episodes', 'trends', 'ideas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'podcasts' && 'Podcasts'}
              {tab === 'episodes' && 'Episodes'}
              {tab === 'trends' && 'Trends'}
              {tab === 'ideas' && 'Business Ideas'}
            </button>
          ))}
        </div>

        {/* Podcasts Tab */}
        {activeTab === 'podcasts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Podcasts</h2>
              <button
                onClick={() => setShowAddPodcast(!showAddPodcast)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                + Add Podcast
              </button>
            </div>

            {showAddPodcast && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Add New Podcast</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newPodcast.name}
                    onChange={(e) => setNewPodcast({ ...newPodcast, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="The Joe Rogan Experience"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    value={newPodcast.description}
                    onChange={(e) => setNewPodcast({ ...newPodcast, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                    rows={3}
                    placeholder="Long-form conversations with interesting people..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Host</label>
                    <input
                      type="text"
                      value={newPodcast.host}
                      onChange={(e) => setNewPodcast({ ...newPodcast, host: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="Joe Rogan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">YouTube Channel ID</label>
                    <input
                      type="text"
                      value={newPodcast.youtube_channel_id}
                      onChange={(e) => setNewPodcast({ ...newPodcast, youtube_channel_id: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="UC..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">RSS Feed URL</label>
                    <input
                      type="url"
                      value={newPodcast.rss_feed_url}
                      onChange={(e) => setNewPodcast({ ...newPodcast, rss_feed_url: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={newPodcast.website_url}
                      onChange={(e) => setNewPodcast({ ...newPodcast, website_url: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPodcast}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add Podcast'}
                  </button>
                  <button
                    onClick={() => setShowAddPodcast(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  onClick={() => {
                    setSelectedPodcast(podcast.id);
                    setActiveTab('episodes');
                  }}
                  className="rounded-xl border border-white/10 bg-slate-900/60 p-6 cursor-pointer hover:border-emerald-400/50 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {podcast.thumbnail_url && (
                      <img src={podcast.thumbnail_url} alt={podcast.name} className="w-16 h-16 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{podcast.name}</h3>
                      {podcast.host && <p className="text-sm text-slate-400">Host: {podcast.host}</p>}
                    </div>
                  </div>
                  {podcast.description && (
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2">{podcast.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      {podcast.episode_count} episodes
                    </span>
                    <span className="text-slate-400">
                      {podcast.transcript_count} transcribed
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {podcasts.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-12 text-center">
                <p className="text-slate-400 mb-4">No podcasts yet</p>
                <button
                  onClick={() => setShowAddPodcast(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  Add Your First Podcast
                </button>
              </div>
            )}
          </div>
        )}

        {/* Episodes Tab */}
        {activeTab === 'episodes' && (
          <div className="space-y-4">
            {selectedPodcast && (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedPodcast(null)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  ← Back to all podcasts
                </button>
              </div>
            )}
            <h2 className="text-2xl font-bold text-white">Episodes</h2>
            {episodes.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">
                  {selectedPodcast ? 'No episodes found for this podcast' : 'Select a podcast to view episodes'}
                </p>
              </div>
            ) : (
              episodes.map((episode) => (
                <div key={episode.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-2">{episode.title}</h3>
                      {episode.guest_name && (
                        <p className="text-sm text-slate-400 mb-2">Guest: {episode.guest_name}</p>
                      )}
                      {episode.published_date && (
                        <p className="text-xs text-slate-500">
                          {new Date(episode.published_date).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          episode.has_transcript
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {episode.has_transcript ? '✓ Transcribed' : 'No transcript'}
                        </span>
                        {episode.insight_count > 0 && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                            {episode.insight_count} insights
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          episode.status === 'analyzed'
                            ? 'bg-purple-500/20 text-purple-300'
                            : episode.status === 'transcribed'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}>
                          {episode.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {episode.has_transcript && episode.status !== 'analyzed' && (
                        <button
                          onClick={() => handleAnalyzeEpisode(episode.id)}
                          disabled={loading}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Trends</h2>
            {trends.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">No trends extracted yet. Analyze some episodes to discover trends!</p>
              </div>
            ) : (
              trends.map((trend) => (
                <div key={trend.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-2">{trend.trend_name}</h3>
                      {trend.description && (
                        <p className="text-sm text-slate-300 mb-3">{trend.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {trend.category && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                          {trend.category}
                        </span>
                      )}
                      {trend.sentiment && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          trend.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' :
                          trend.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {trend.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Mentioned {trend.mention_count} time{trend.mention_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Business Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Business Ideas</h2>
            {businessIdeas.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">No business ideas extracted yet. Analyze episodes to discover opportunities!</p>
              </div>
            ) : (
              businessIdeas.map((idea) => (
                <div key={idea.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <h3 className="font-bold text-white text-lg mb-2">{idea.idea_title}</h3>
                  <p className="text-sm text-slate-300 mb-4">{idea.idea_description}</p>
                  <div className="flex items-center gap-2">
                    {idea.market_category && (
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                        {idea.market_category}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

