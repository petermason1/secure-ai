'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  specialty?: string;
  latest_task?: {
    type: string;
    description: string;
    priority: string;
    assigned_at: string;
  };
  message_count: number;
  created_at: string;
}

interface ActivityData {
  stats: {
    total_agents: number;
    active_agents: number;
    total_tasks: number;
    recent_messages: number;
    new_since_last_check?: {
      new_tasks: number;
      new_messages: number;
    };
  };
  agents: Agent[];
  recent_activity: {
    tasks: any[];
    messages: any[];
  };
}

interface TokenStatus {
  id: string;
  name: string;
  department: string;
  status: string;
  is_autonomous: boolean;
  tokens_per_run: number;
  safe_tokens_per_run: number;
  total_runs_overnight: number;
  safe_overnight_budget: number;
  max_overnight_budget: number;
  estimated_daily_usage: number;
  icon: string;
}

const LAST_CHECK_KEY = 'bot-activity-hud-last-check';

const TASK_TYPES = [
  { value: 'code_review', label: 'Code Review' },
  { value: 'bug_fix', label: 'Bug Fix' },
  { value: 'test', label: 'Write Tests' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'refactor', label: 'Refactor' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function BotActivityHUD() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [newActivityCount, setNewActivityCount] = useState({ tasks: 0, messages: 0 });
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChangeFocus, setShowChangeFocus] = useState(false);
  const [changingFocus, setChangingFocus] = useState(false);
  const [showTokenStatus, setShowTokenStatus] = useState(true);
  const [newTask, setNewTask] = useState({
    type: 'documentation',
    description: '',
    priority: 'medium',
    file_path: '',
  });

  const loadActivity = useCallback(async (since?: string) => {
    try {
      const url = since 
        ? `/api/junior-dev-team/activity?since=${encodeURIComponent(since)}`
        : '/api/junior-dev-team/activity';
      
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setData(result);
        
        if (since && result.stats.new_since_last_check) {
          setNewActivityCount({
            tasks: result.stats.new_since_last_check.new_tasks,
            messages: result.stats.new_since_last_check.new_messages,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTokenStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bots/token-status');
      const result = await res.json();
      if (result.success) {
        setTokenStatus(result);
      }
    } catch (error) {
      console.error('Failed to load token status:', error);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_CHECK_KEY);
    if (saved) {
      setLastCheckTime(saved);
    }
    
    loadActivity(saved || undefined);
    loadTokenStatus();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadActivity(saved || undefined);
        loadTokenStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadActivity, loadTokenStatus]);

  const markAsChecked = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_CHECK_KEY, now);
    setLastCheckTime(now);
    setNewActivityCount({ tasks: 0, messages: 0 });
    loadActivity();
  };

  const handleChangeFocus = (agent: Agent) => {
    setSelectedAgent(agent);
    setNewTask({
      type: agent.latest_task?.type || 'documentation',
      description: '',
      priority: agent.latest_task?.priority || 'medium',
      file_path: '',
    });
    setShowChangeFocus(true);
  };

  const submitChangeFocus = async () => {
    if (!selectedAgent || !newTask.description.trim()) {
      alert('Please enter a task description');
      return;
    }

    setChangingFocus(true);
    try {
      const res = await fetch('/api/junior-dev-team/update-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgent.id,
          new_task_type: newTask.type,
          new_description: newTask.description,
          new_priority: newTask.priority,
          file_path: newTask.file_path || null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ ${selectedAgent.name} is now working on: ${newTask.description}`);
        setShowChangeFocus(false);
        setSelectedAgent(null);
        loadActivity(lastCheckTime || undefined);
      } else {
        alert('Error: ' + (result.error || 'Failed to change focus'));
      }
    } catch (error) {
      alert('Error changing focus: ' + error);
    } finally {
      setChangingFocus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'busy': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-slate-400';
      default: return 'text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white">Loading bot activity...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400">Failed to load activity data</div>
        </div>
      </div>
    );
  }

  const hasNewActivity = newActivityCount.tasks > 0 || newActivityCount.messages > 0;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-2 inline-block text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">🤖 Bot Activity HUD</h1>
            <p className="text-slate-400 text-sm">Real-time activity monitor for all junior dev bots</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-slate-300 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-refresh (5s)
            </label>
            <button
              onClick={() => loadActivity(lastCheckTime || undefined)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Since Last Check Banner */}
        {lastCheckTime && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            hasNewActivity 
              ? 'bg-yellow-900/20 border-yellow-500' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold mb-1">
                  📍 Since Last Check
                  {hasNewActivity && (
                    <span className="ml-2 text-yellow-400">
                      ({newActivityCount.tasks} new tasks, {newActivityCount.messages} new messages)
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-sm">
                  Last checked: {new Date(lastCheckTime).toLocaleString()}
                  {!hasNewActivity && <span className="ml-2 text-emerald-400">✓ All caught up!</span>}
                </div>
              </div>
              <button
                onClick={markAsChecked}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                ✓ Mark as Checked
              </button>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Total Bots</div>
            <div className="text-2xl font-bold text-white">{data.stats.total_agents}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Active</div>
            <div className="text-2xl font-bold text-emerald-400">{data.stats.active_agents}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Total Tasks</div>
            <div className="text-2xl font-bold text-yellow-400">{data.stats.total_tasks}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Messages</div>
            <div className="text-2xl font-bold text-blue-400">{data.stats.recent_messages}</div>
          </div>
        </div>

        {/* Token Status Panel */}
        {showTokenStatus && tokenStatus && tokenStatus.summary && (
          <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💰 Token Budget Status
                <button
                  onClick={() => setShowTokenStatus(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-900/60 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Autonomous Bots</div>
                <div className="text-2xl font-bold text-purple-400">{tokenStatus.summary?.active_autonomous_bots || 0}</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Safe Overnight Budget</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {Math.round((tokenStatus.summary?.total_safe_overnight_budget || 0) / 1000)}K
                </div>
                <div className="text-xs text-slate-500 mt-1">tokens</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Max Overnight Budget</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round((tokenStatus.summary?.total_max_overnight_budget || 0) / 1000)}K
                </div>
                <div className="text-xs text-slate-500 mt-1">tokens</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Est. Daily Usage</div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((tokenStatus.summary?.total_estimated_daily_usage || 0) / 1000)}K
                </div>
                <div className="text-xs text-slate-500 mt-1">tokens</div>
              </div>
            </div>

            <div className="text-sm text-slate-300 mb-4">
              <p>⏰ Hours until morning (9am): <span className="font-semibold text-white">{tokenStatus.overnight_hours || 0}</span></p>
              <p>🔄 Runs per hour: <span className="font-semibold text-white">{tokenStatus.runs_per_hour || 0}</span> (every 15 min)</p>
            </div>

            {/* Bot Token Breakdown */}
            {tokenStatus.bots && tokenStatus.bots.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Bot Token Budgets (Overnight)</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {tokenStatus.bots
                    .filter((bot: TokenStatus) => bot.is_autonomous)
                    .map((bot: TokenStatus) => (
                      <div key={bot.id} className="bg-slate-900/60 rounded p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span>{bot.icon || '🤖'}</span>
                            <span className="font-semibold text-white">{bot.name}</span>
                            <span className="text-xs text-slate-500">({bot.department})</span>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-semibold">
                              {Math.round((bot.safe_overnight_budget || 0) / 1000)}K safe
                            </div>
                            <div className="text-xs text-slate-500">
                              {bot.total_runs_overnight || 0} runs × {bot.safe_tokens_per_run || 0} tokens
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                          <span>{bot.tokens_per_run || 0} tokens/run</span>
                          <span>•</span>
                          <span>Max: {Math.round((bot.max_overnight_budget || 0) / 1000)}K</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!showTokenStatus && (
          <button
            onClick={() => setShowTokenStatus(true)}
            className="mb-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            💰 Show Token Budget Status
          </button>
        )}

        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {data.agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-emerald-500 transition-colors"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
                  {agent.specialty && (
                    <div className="text-xs text-emerald-400 mb-2">{agent.specialty}</div>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} title={agent.status} />
              </div>

              {/* Current Task */}
              {agent.latest_task ? (
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Current Task:</div>
                  <div className="text-sm text-white font-medium mb-1">
                    {agent.latest_task.type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-2 mb-1">
                    {agent.latest_task.description}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium ${getPriorityColor(agent.latest_task.priority)}`}>
                      {agent.latest_task.priority}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(agent.latest_task.assigned_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
                  <div className="text-xs text-slate-500">No active task</div>
                </div>
              )}

              {/* Change Focus Button */}
              <button
                onClick={() => handleChangeFocus(agent)}
                className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold"
              >
                🎯 Change Focus
              </button>

              {/* Activity Stats */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Messages: {agent.message_count}</span>
                <span>{agent.capabilities.length} capabilities</span>
              </div>
            </div>
          ))}
        </div>

        {/* Change Focus Modal */}
        {showChangeFocus && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Change Focus: {selectedAgent.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Task Type
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    {TASK_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Task Description *
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="What should this bot work on?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      {PRIORITIES.map(pri => (
                        <option key={pri.value} value={pri.value}>{pri.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      File Path (optional)
                    </label>
                    <input
                      type="text"
                      value={newTask.file_path}
                      onChange={(e) => setNewTask({ ...newTask, file_path: e.target.value })}
                      placeholder="apps/web/src/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={submitChangeFocus}
                  disabled={changingFocus || !newTask.description.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  {changingFocus ? 'Changing...' : '✓ Change Focus'}
                </button>
                <button
                  onClick={() => {
                    setShowChangeFocus(false);
                    setSelectedAgent(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Tasks */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">
              📋 Recent Tasks
              {lastCheckTime && hasNewActivity && (
                <span className="ml-2 text-yellow-400 text-sm">
                  ({newActivityCount.tasks} new)
                </span>
              )}
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.recent_activity.tasks.length > 0 ? (
                data.recent_activity.tasks.map((task, idx) => {
                  const isNew = lastCheckTime && new Date(task.created_at) > new Date(lastCheckTime);
                  return (
                    <div 
                      key={idx} 
                      className={`text-sm p-2 bg-slate-900 rounded border ${
                        isNew ? 'border-yellow-500 bg-yellow-900/10' : 'border-slate-700'
                      }`}
                    >
                      {isNew && <span className="text-yellow-400 text-xs mr-2">🆕</span>}
                      <div className="text-white font-medium">{task.task_type}</div>
                      <div className="text-slate-400 text-xs line-clamp-1">{task.description}</div>
                      <div className="text-slate-500 text-xs mt-1">
                        {new Date(task.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 text-sm">No recent tasks</div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">
              💬 Recent Messages
              {lastCheckTime && hasNewActivity && (
                <span className="ml-2 text-yellow-400 text-sm">
                  ({newActivityCount.messages} new)
                </span>
              )}
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.recent_activity.messages.length > 0 ? (
                data.recent_activity.messages.map((msg, idx) => {
                  const isNew = lastCheckTime && new Date(msg.created_at) > new Date(lastCheckTime);
                  return (
                    <div 
                      key={idx} 
                      className={`text-sm p-2 bg-slate-900 rounded border ${
                        isNew ? 'border-yellow-500 bg-yellow-900/10' : 'border-slate-700'
                      }`}
                    >
                      {isNew && <span className="text-yellow-400 text-xs mr-2">🆕</span>}
                      <div className="text-white font-medium">{msg.type}</div>
                      <div className="text-slate-400 text-xs">
                        {msg.from} → {msg.to || 'broadcast'}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 text-sm">No recent messages</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
