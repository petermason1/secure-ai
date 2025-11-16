/**
 * BotCard Component
 * 
 * Enhanced bot card displaying:
 * - Bot profile with avatar
 * - Real-time status indicators
 * - Current task with progress
 * - Performance metrics with sparklines
 * - Quick action buttons
 * - Task history preview
 * 
 * @component
 * @example
 * ```tsx
 * <BotCard 
 *   bot={botData}
 *   onTaskAssign={(task) => handleAssign(task)}
 *   onViewHistory={() => openHistory(bot.id)}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { Sparkline } from './Sparkline';
import { EffortMetrics } from './EffortMetrics';
import { TaskQuickActions } from './TaskQuickActions';

interface Bot {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  specialty?: string;
  latest_task?: {
    type: string;
    description: string;
    priority: string;
    assigned_at: string;
    status?: string;
  };
  message_count: number;
  performance_metrics?: {
    tasks_completed: number;
    avg_completion_time: number;
    success_rate: number;
    recent_performance: number[];
  };
}

interface BotCardProps {
  bot: Bot;
  onTaskAssign?: (botId: string, task: any) => void;
  onViewHistory?: (botId: string) => void;
  onEditTask?: (botId: string, taskId: string) => void;
}

export function BotCard({ bot, onTaskAssign, onViewHistory, onEditTask }: BotCardProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'busy': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'busy': return 'Busy';
      case 'error': return 'Error';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-500/30';
      case 'medium': return 'text-yellow-400 border-yellow-500/30';
      case 'low': return 'text-slate-400 border-slate-500/30';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="group relative bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(bot.status)}`} />

      {/* Error Alert Badge */}
      {bot.status === 'error' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          ⚠️ Error
        </div>
      )}

      {/* Offline Badge */}
      {bot.status === 'offline' && (
        <div className="absolute top-2 right-2 bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Offline
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
                {bot.name.charAt(0).toUpperCase()}
              </div>
              {/* Status Dot */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(bot.status)} rounded-full border-2 border-slate-800`} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{bot.name}</h3>
              {bot.specialty && (
                <div className="text-xs text-emerald-400 font-medium">{bot.specialty}</div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bot.status)}/20 text-${getStatusColor(bot.status).replace('bg-', '')} border border-${getStatusColor(bot.status)}/30`}>
            {getStatusLabel(bot.status)}
          </div>
        </div>

        {/* Current Task */}
        {bot.latest_task ? (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-400 font-medium">Current Task</div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getPriorityColor(bot.latest_task.priority)}`}>
                {bot.latest_task.priority}
              </span>
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {bot.latest_task.type.replace(/_/g, ' ')}
            </div>
            <div className="text-xs text-slate-400 line-clamp-2 mb-2">
              {bot.latest_task.description}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(bot.latest_task.assigned_at).toLocaleTimeString()}</span>
              {onEditTask && (
                <button
                  onClick={() => onEditTask(bot.id, bot.latest_task!.type)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Edit →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30 border-dashed">
            <div className="text-xs text-slate-500 text-center">No active task</div>
          </div>
        )}

        {/* Performance Metrics */}
        {bot.performance_metrics && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Performance</span>
              <span className="text-emerald-400 font-semibold">
                {bot.performance_metrics.success_rate}% success
              </span>
            </div>
            {bot.performance_metrics.recent_performance && bot.performance_metrics.recent_performance.length > 0 && (
              <div className="h-8">
                <Sparkline data={bot.performance_metrics.recent_performance} />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-slate-400">Tasks</div>
                <div className="text-white font-semibold">{bot.performance_metrics.tasks_completed}</div>
              </div>
              <div>
                <div className="text-slate-400">Avg Time</div>
                <div className="text-white font-semibold">{bot.performance_metrics.avg_completion_time}m</div>
              </div>
              <div>
                <div className="text-slate-400">Messages</div>
                <div className="text-white font-semibold">{bot.message_count}</div>
              </div>
            </div>
          </div>
        )}

        {/* Effort Metrics */}
        <div className="mb-4">
          <EffortMetrics agentId={bot.id} agentName={bot.name} />
        </div>

        {/* Capabilities Tags */}
        {bot.capabilities && bot.capabilities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {bot.capabilities.slice(0, 3).map((cap, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded"
              >
                {cap.replace(/_/g, ' ')}
              </span>
            ))}
            {bot.capabilities.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                +{bot.capabilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            {showQuickActions ? 'Cancel' : '🎯 Assign Task'}
          </button>
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(bot.id)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              📜 History
            </button>
          )}
        </div>

        {/* Quick Actions Panel */}
        {showQuickActions && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <TaskQuickActions
              botId={bot.id}
              botName={bot.name}
              onAssign={(task) => {
                if (onTaskAssign) {
                  onTaskAssign(bot.id, task);
                  setShowQuickActions(false);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
