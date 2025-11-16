/**
 * TaskQuickActions Component
 * 
 * Quick task assignment interface with drag-drop support.
 * Provides fast task creation and assignment.
 * 
 * @component
 */

'use client';

import { useState } from 'react';

interface TaskQuickActionsProps {
  botId: string;
  botName: string;
  onAssign: (task: any) => void;
}

const TASK_TYPES = [
  { value: 'code_review', label: 'Code Review', icon: '👁️' },
  { value: 'bug_fix', label: 'Bug Fix', icon: '🐛' },
  { value: 'test', label: 'Write Tests', icon: '✅' },
  { value: 'documentation', label: 'Documentation', icon: '📝' },
  { value: 'refactor', label: 'Refactor', icon: '🔧' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-red-400' },
];

export function TaskQuickActions({ botId, botName, onAssign }: TaskQuickActionsProps) {
  const [taskType, setTaskType] = useState('code_review');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filePath, setFilePath] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a task description');
      return;
    }

    onAssign({
      task_type: taskType,
      description: description.trim(),
      priority,
      file_path: filePath || null,
    });

    // Reset form
    setDescription('');
    setFilePath('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Task Type
        </label>
        <div className="grid grid-cols-5 gap-1">
          {TASK_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setTaskType(type.value)}
              className={`p-2 rounded text-xs transition-colors ${
                taskType === type.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={type.label}
            >
              {type.icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should this bot work on?"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm min-h-[60px] focus:outline-none focus:border-emerald-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            File Path (optional)
          </label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="apps/web/src/..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        ✓ Assign to {botName}
      </button>
    </form>
  );
}
