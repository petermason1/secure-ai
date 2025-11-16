/**
 * EffortMetrics Component
 * 
 * Displays effort metrics for a bot and allows applying effort.
 * Shows time spent, priority boost, resources allocated, and effort score.
 * 
 * @component
 */

'use client';

import { useState, useEffect } from 'react';

interface EffortMetricsProps {
  agentId: string;
  agentName: string;
}

interface EffortData {
  totals: {
    total_hours: number;
    total_tasks: number;
    avg_priority: number;
    total_resources: number;
    avg_effort_score: number;
  };
  daily_summaries: Array<{
    date: string;
    total_hours: number;
    tasks_completed: number;
    priority_boost: number;
    resources_allocated: number;
    effort_score: number;
  }>;
  active_allocations: Array<{
    id: string;
    effort_type: string;
    effort_amount: number;
    reason: string;
    expires_at: string | null;
  }>;
}

export function EffortMetrics({ agentId, agentName }: EffortMetricsProps) {
  const [metrics, setMetrics] = useState<EffortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    effort_amount: 1,
    effort_type: 'time',
    reason: '',
    duration_minutes: 60,
  });

  useEffect(() => {
    loadMetrics();
  }, [agentId]);

  const loadMetrics = async () => {
    try {
      const res = await fetch(`/api/bots/effort/metrics?agent_id=${agentId}&period=week`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyEffort = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const res = await fetch('/api/bots/effort/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Applied ${formData.effort_amount} ${formData.effort_type} to ${agentName}`);
        setShowApplyForm(false);
        setFormData({ effort_amount: 1, effort_type: 'time', reason: '', duration_minutes: 60 });
        loadMetrics();
      } else {
        alert('Error: ' + (data.error || 'Failed to apply effort'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="text-slate-400 text-sm">Loading effort metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="text-slate-400 text-sm">No metrics available</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Effort Metrics</h3>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-semibold"
        >
          {showApplyForm ? 'Cancel' : '➕ Apply Effort'}
        </button>
      </div>

      {/* Apply Effort Form */}
      {showApplyForm && (
        <form onSubmit={handleApplyEffort} className="bg-slate-900 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Effort Type
            </label>
            <select
              value={formData.effort_type}
              onChange={(e) => setFormData({ ...formData, effort_type: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="time">Time (hours)</option>
              <option value="priority">Priority Boost (0-100)</option>
              <option value="resources">Resources (units)</option>
              <option value="focus">Focus Boost</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.effort_amount}
              onChange={(e) => setFormData({ ...formData, effort_amount: parseFloat(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Why are you applying this effort?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {formData.effort_type === 'time' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={applying}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {applying ? 'Applying...' : 'Apply Effort'}
          </button>
        </form>
      )}

      {/* Metrics Display */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Total Hours"
          value={metrics.totals.total_hours.toFixed(1)}
          icon="⏱️"
          color="blue"
        />
        <MetricCard
          label="Effort Score"
          value={metrics.totals.avg_effort_score.toFixed(1)}
          icon="📊"
          color="emerald"
        />
        <MetricCard
          label="Priority Boost"
          value={metrics.totals.avg_priority.toFixed(0) + '%'}
          icon="⚡"
          color="yellow"
        />
        <MetricCard
          label="Resources"
          value={metrics.totals.total_resources.toFixed(1)}
          icon="💎"
          color="purple"
        />
      </div>

      {/* Active Allocations */}
      {metrics.active_allocations.length > 0 && (
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">Active Allocations</div>
          <div className="space-y-2">
            {metrics.active_allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="bg-slate-900 rounded p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {allocation.effort_type}: {allocation.effort_amount}
                  </span>
                  {allocation.expires_at && (
                    <span className="text-slate-400">
                      Expires: {new Date(allocation.expires_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {allocation.reason && (
                  <div className="text-slate-400 mt-1">{allocation.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'emerald' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-slate-900 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className={`text-xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
