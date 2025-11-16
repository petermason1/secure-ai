'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PostTeamPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    urgent: 0,
    spam: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/post-team/messages?status=new&limit=20');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // In production, this would fetch from /api/post-team/stats
    setStats({
      total: 150,
      new: 12,
      urgent: 3,
      spam: 2,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'normal': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-300';
      case 'negative': return 'text-red-300';
      case 'angry': return 'text-red-500';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base">
              PT
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                Post Team
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg">
                Communications Hub
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4 sm:text-sm"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Messages</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="text-2xl font-bold text-blue-300">{stats.new}</div>
            <div className="text-sm text-slate-400">New Messages</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="text-2xl font-bold text-red-300">{stats.urgent}</div>
            <div className="text-sm text-slate-400">Urgent</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="text-2xl font-bold text-yellow-300">{stats.spam}</div>
            <div className="text-sm text-slate-400">Spam Detected</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Incoming Messages
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            All messages scanned, categorized, and routed automatically
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center text-green-300">
            No new messages ✅
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {message.subject || 'No Subject'}
                      </h3>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      {message.is_spam && (
                        <span className="rounded-full border border-yellow-500/40 bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-300">
                          SPAM
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                      {message.content}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-400">
                        From: {message.sender_email || 'Unknown'}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {message.category}
                      </span>
                      <span className={`text-xs ${getSentimentColor(message.sentiment)}`}>
                        • {message.sentiment}
                      </span>
                      {message.assigned_to && (
                        <span className="text-xs text-emerald-300">
                          • → {message.assigned_to}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="font-semibold text-white">How It Works</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Scans all incoming messages (email, social, support)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>AI categorizes by type, topic, and department</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Analyzes sentiment and detects urgency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Routes to correct agent automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Tracks response times and prevents missed messages</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

