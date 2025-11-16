'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  status: string;
  published_at: string;
  read_time_minutes: number;
  tags: string[];
  views_count: number;
}

interface BlogAgent {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  metadata: any;
}

export default function BlogDepartmentPage() {
  const [agents, setAgents] = useState<BlogAgent[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({ total_posts: 0, published_posts: 0, draft_posts: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/blog-department/list');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents || []);
        setPosts(data.posts || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDaily = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/blog-department/generate-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Blog post generated: ${data.post.title}`);
        await loadData();
      } else {
        alert('Error: ' + (data.error || 'Failed to generate blog post'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/60 p-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ✍️ Blog Department
          </h1>
          <p className="text-sm text-slate-400">Autonomous daily blog post creation, content planning, SEO optimization</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                <div className="text-2xl font-bold text-emerald-400">{stats.total_posts}</div>
                <div className="text-sm text-slate-400">Total Posts</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.published_posts}</div>
                <div className="text-sm text-slate-400">Published</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                <div className="text-2xl font-bold text-purple-400">{stats.draft_posts}</div>
                <div className="text-sm text-slate-400">Drafts</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={handleGenerateDaily}
                disabled={generating}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {generating ? 'Generating...' : '📝 Generate Daily Blog Post'}
              </button>
              <Link
                href="/blog"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                View Blog →
              </Link>
            </div>

            {/* Agents */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Blog Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                    <div className="text-2xl mb-2">{agent.metadata?.icon || '🤖'}</div>
                    <div className="font-semibold text-white">{agent.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{agent.capabilities.length} capabilities</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Recent Posts</h2>
              {posts.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-white/10 bg-slate-900/60">
                  <p className="text-slate-400 mb-4">No blog posts yet.</p>
                  <button
                    onClick={handleGenerateDaily}
                    disabled={generating}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Generate First Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              post.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {post.status}
                            </span>
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                          <p className="text-slate-300 text-sm mb-3">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{formatDate(post.published_at)}</span>
                            <span>•</span>
                            <span>{post.read_time_minutes} min read</span>
                            {post.views_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{post.views_count} views</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="ml-4 text-emerald-400 hover:text-emerald-300 text-sm"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

