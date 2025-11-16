'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  agent_id: string;
  task_type: string;
  description: string;
  priority: string;
  file_path?: string;
  status: string;
  created_at: string;
}

interface BoardData {
  board: {
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
  };
  stats: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    total: number;
  };
}

const COLUMNS = [
  { id: 'todo', name: 'To Do', color: 'bg-slate-700' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-700' },
  { id: 'review', name: 'Review', color: 'bg-yellow-700' },
  { id: 'done', name: 'Done', color: 'bg-emerald-700' },
];

export default function KanbanBoardPage() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadBoard();
    
    if (autoRefresh) {
      const interval = setInterval(loadBoard, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadBoard = async () => {
    try {
      const res = await fetch('/api/junior-dev-team/kanban/board');
      const data = await res.json();
      if (data.success) {
        setBoardData(data);
      }
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, newColumn: string) => {
    try {
      const res = await fetch('/api/junior-dev-team/kanban/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, new_column: newColumn }),
      });

      const data = await res.json();
      if (data.success) {
        loadBoard();
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (columnId: string) => {
    if (draggedTask) {
      moveTask(draggedTask, columnId);
      setDraggedTask(null);
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
          <div className="text-white">Loading KANBAN board...</div>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400">Failed to load board</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/bot-activity-hud" className="text-emerald-400 hover:text-emerald-300 mb-2 inline-block text-sm">
              ← Back to Bot Activity HUD
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">📋 KANBAN Board</h1>
            <p className="text-slate-400 text-sm">Visual task management for junior dev team</p>
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
              onClick={loadBoard}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Total</div>
            <div className="text-2xl font-bold text-white">{boardData.stats.total}</div>
          </div>
          {COLUMNS.map(col => (
            <div key={col.id} className={`${col.color} rounded-lg p-4 border border-slate-700`}>
              <div className="text-white/80 text-sm">{col.name}</div>
              <div className="text-2xl font-bold text-white">{boardData.stats[col.id as keyof typeof boardData.stats]}</div>
            </div>
          ))}
        </div>

        {/* KANBAN Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => {
            const tasks = boardData.board[column.id as keyof typeof boardData.board] || [];
            return (
              <div
                key={column.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 min-h-[500px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(column.id)}
              >
                <h2 className={`${column.color} text-white font-semibold px-3 py-2 rounded mb-4`}>
                  {column.name} ({tasks.length})
                </h2>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-emerald-500 cursor-move transition-colors"
                    >
                      <div className="text-xs text-slate-400 mb-1">
                        {task.task_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-white font-medium mb-2 line-clamp-2">
                        {task.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {task.file_path && (
                        <div className="text-xs text-slate-500 mt-2 truncate">
                          📁 {task.file_path}
                        </div>
                      )}
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-slate-500 text-sm text-center py-8">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
