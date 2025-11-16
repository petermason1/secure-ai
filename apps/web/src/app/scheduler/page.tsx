/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location?: string;
  tags: string[];
}

export default function SchedulerPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    durationMinutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    location: 'Virtual',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scheduler/events/list');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime) {
      setError('Please fill in title, date, and start time.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const start = new Date(`${form.date}T${form.startTime}`);
      const end = new Date(start.getTime() + form.durationMinutes * 60000);

      const response = await fetch('/api/scheduler/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          timezone: form.timezone,
          location: form.location,
          tags: ['meeting', 'ai-team'],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setForm({
          ...form,
          title: '',
          description: '',
          date: '',
          startTime: '',
        });
        fetchEvents();
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">🗓️ AI Team Scheduler</h1>
            <p className="text-slate-400 text-sm">
              Basic scheduling tool that works across devices.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-3">Create Event</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-300">Title *</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="AI virtual team sync"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Agenda or goal"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Date *</label>
                <input
                  type="date"
                  className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Start Time *</label>
                <input
                  type="time"
                  className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Duration (minutes)</label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Timezone</label>
                <input
                  type="text"
                  className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Location</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {submitting ? 'Saving...' : 'Save Event'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <button
              onClick={fetchEvents}
              className="text-sm text-slate-400 hover:text-white"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-400 text-sm">No events scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-white/10 bg-slate-800/60 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      {event.location && (
                        <p className="text-xs text-slate-400">{event.location}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {event.timezone}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                  </p>
                  {event.description && (
                    <p className="text-sm text-slate-400 mt-2">{event.description}</p>
                  )}
                  {event.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 border border-white/10 text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

