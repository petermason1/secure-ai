'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string;
  read_time_minutes: number;
  tags: string[];
  views_count: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-department/list?status=published&limit=50');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
            Why.ai Blog
          </h1>
          <p className="text-xl text-slate-300">
            Insights on AI, startups, and building products that actually work. Powered by autonomous AI.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No blog posts yet.</p>
            <Link
              href="/blog-department"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Visit Blog Department to generate posts
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-6 hover:border-emerald-400/30 transition">
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 hover:text-emerald-400 transition">
                    {post.title}
                  </h2>
                  <p className="text-slate-300 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
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
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
