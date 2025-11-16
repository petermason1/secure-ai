/**
 * BotFilters Component
 * 
 * Advanced filtering and search for bots and tasks.
 * Supports status, capability, and text search.
 * 
 * @component
 */

'use client';

import { useState } from 'react';

interface BotFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  status: string[];
  capabilities: string[];
  hasErrors: boolean;
  hasOffline: boolean;
}

export function BotFilters({ onFilterChange }: BotFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    capabilities: [],
    hasErrors: false,
    hasOffline: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatus);
  };

  const toggleCapability = (capability: string) => {
    const newCaps = filters.capabilities.includes(capability)
      ? filters.capabilities.filter(c => c !== capability)
      : [...filters.capabilities, capability];
    updateFilter('capabilities', newCaps);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bots, tasks, or capabilities..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="absolute left-3 top-2.5 text-slate-500">🔍</div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => updateFilter('hasErrors', !filters.hasErrors)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filters.hasErrors
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          ⚠️ Errors Only
        </button>
        <button
          onClick={() => updateFilter('hasOffline', !filters.hasOffline)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filters.hasOffline
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          📴 Offline Only
        </button>
        {filters.status.length > 0 && (
          <button
            onClick={() => updateFilter('status', [])}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Clear Status
          </button>
        )}
        {(filters.search || filters.status.length > 0 || filters.capabilities.length > 0 || filters.hasErrors || filters.hasOffline) && (
          <button
            onClick={() => {
              const cleared = {
                search: '',
                status: [],
                capabilities: [],
                hasErrors: false,
                hasOffline: false,
              };
              setFilters(cleared);
              onFilterChange(cleared);
            }}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
      >
        {showAdvanced ? '▼' : '▶'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
          {/* Status Filters */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['active', 'busy', 'error', 'offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Capability Filters */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Capabilities
            </label>
            <div className="flex flex-wrap gap-2">
              {['code_review', 'bug_fix', 'test', 'documentation', 'refactor'].map((cap) => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filters.capabilities.includes(cap)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cap.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
