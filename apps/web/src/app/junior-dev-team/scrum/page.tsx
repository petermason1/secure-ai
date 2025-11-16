'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Meeting {
  id: string;
  meeting_type: string;
  scheduled_time: string;
  duration_minutes: number;
  agenda?: string;
  status: string;
  created_at: string;
}

interface StandupReport {
  agent_id: string;
  agent_name: string;
  yesterday: string;
  today: string;
  blockers: string;
}

const MEETING_TYPES = [
  { value: 'standup', label: 'Daily Standup' },
  { value: 'sprint_planning', label: 'Sprint Planning' },
  { value: 'retrospective', label: 'Retrospective' },
  { value: 'review', label: 'Code Review Meeting' },
  { value: 'sync', label: 'Team Sync' },
];

export default function ScrumMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [runningStandup, setRunningStandup] = useState(false);
  const [standupResults, setStandupResults] = useState<any>(null);
  const [newMeeting, setNewMeeting] = useState({
    type: 'standup',
    scheduled_time: new Date().toISOString().slice(0, 16),
    duration_minutes: 15,
    agenda: '',
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await fetch('/api/junior-dev-team/scrum/list');
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async () => {
    try {
      const res = await fetch('/api/junior-dev-team/scrum/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Meeting scheduled: ${newMeeting.type} at ${new Date(newMeeting.scheduled_time).toLocaleString()}`);
        setShowSchedule(false);
        loadMeetings();
      } else {
        alert('Error: ' + (data.error || 'Failed to schedule meeting'));
      }
    } catch (error) {
      alert('Error scheduling meeting: ' + error);
    }
  };

  const runStandup = async () => {
    setRunningStandup(true);
    try {
      const res = await fetch('/api/junior-dev-team/scrum/standup', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        setStandupResults(data);
        alert(`✅ Standup completed with ${data.participants} participants!`);
      } else {
        alert('Error: ' + (data.error || 'Failed to run standup'));
      }
    } catch (error) {
      alert('Error running standup: ' + error);
    } finally {
      setRunningStandup(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/bot-activity-hud" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Bot Activity HUD
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">📅 Scrum Meetings</h1>
          <p className="text-slate-300">Schedule and run scrum meetings for the junior dev team</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowSchedule(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-lg font-semibold text-lg"
          >
            📅 Schedule Meeting
          </button>
          <button
            onClick={runStandup}
            disabled={runningStandup}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-semibold text-lg"
          >
            {runningStandup ? '🔄 Running Standup...' : '⚡ Run Standup Now'}
          </button>
        </div>

        {/* Standup Results */}
        {standupResults && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              📊 Standup Results ({standupResults.participants} participants)
            </h2>
            <div className="space-y-4">
              {standupResults.reports.map((report: StandupReport, idx: number) => (
                <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{report.agent_name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Yesterday</div>
                      <div className="text-sm text-slate-300">{report.yesterday}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Today</div>
                      <div className="text-sm text-slate-300">{report.today}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Blockers</div>
                      <div className="text-sm text-slate-300">{report.blockers}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Meetings */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">📅 Scheduled Meetings</h2>
          {meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {MEETING_TYPES.find(t => t.value === meeting.meeting_type)?.label || meeting.meeting_type}
                      </h3>
                      <div className="text-sm text-slate-300 space-y-1">
                        <div>📅 {new Date(meeting.scheduled_time).toLocaleString()}</div>
                        <div>⏱️ {meeting.duration_minutes} minutes</div>
                        {meeting.agenda && <div>📋 {meeting.agenda}</div>}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      meeting.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                      meeting.status === 'completed' ? 'bg-emerald-900 text-emerald-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400">No meetings scheduled</div>
          )}
        </div>

        {/* Schedule Modal */}
        {showSchedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Schedule Meeting</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    {MEETING_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Scheduled Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduled_time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_time: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newMeeting.duration_minutes}
                      onChange={(e) => setNewMeeting({ ...newMeeting, duration_minutes: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      min="5"
                      max="120"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Agenda (optional)
                  </label>
                  <textarea
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    placeholder="What will be discussed in this meeting?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={scheduleMeeting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  ✓ Schedule Meeting
                </button>
                <button
                  onClick={() => setShowSchedule(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
