'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DepartmentHealth {
  name: string;
  href: string;
  status: 'healthy' | 'degraded' | 'down' | 'not_found';
  agents_count: number;
  active_agents: number;
  last_activity?: string;
  issues: string[];
}

interface APITest {
  endpoint: string;
  status: 'working' | 'error' | 'not_tested';
}

export default function HealthCheckPage() {
  const [departments, setDepartments] = useState<DepartmentHealth[]>([]);
  const [apiTests, setApiTests] = useState<Record<string, APITest>>({});
  const [summary, setSummary] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    not_found: 0,
  });
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health-check/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments || []);
        setApiTests(data.api_tests || {});
        setSummary(data.summary || {});
        setLastChecked(data.timestamp || new Date().toISOString());
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'down':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'not_found':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'down':
        return '❌';
      case 'not_found':
        return '❓';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            🏥 System Health Check
          </h1>
          <p className="text-xl text-slate-300">
            Monitor all departments and identify which ones are working and which aren't
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Total Departments</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Healthy</p>
            <p className="text-2xl font-bold text-emerald-400">{summary.healthy}</p>
          </div>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Degraded</p>
            <p className="text-2xl font-bold text-yellow-400">{summary.degraded}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Down</p>
            <p className="text-2xl font-bold text-red-400">{summary.down}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Not Found</p>
            <p className="text-2xl font-bold text-white">{summary.not_found}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Last checked: {lastChecked ? new Date(lastChecked).toLocaleString() : 'Never'}
          </p>
          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
          >
            {loading ? 'Checking...' : '🔄 Run Health Check'}
          </button>
        </div>

        {/* Departments */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Departments</h2>
          {departments.map((dept) => (
            <div key={dept.name} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(dept.status)}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{dept.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(dept.status)}`}>
                          {dept.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {dept.active_agents}/{dept.agents_count} agents active
                        </span>
                      </div>
                    </div>
                  </div>
                  {dept.issues.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {dept.issues.map((issue, i) => (
                        <p key={i} className="text-sm text-yellow-300">⚠️ {issue}</p>
                      ))}
                    </div>
                  )}
                  {dept.last_activity && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last activity: {new Date(dept.last_activity).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  <Link
                    href={dept.href}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Tests */}
        {Object.keys(apiTests).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">API Endpoint Tests</h2>
            <div className="space-y-2">
              {Object.entries(apiTests).map(([dept, test]) => (
                <div key={dept} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-4">
                  <div>
                    <p className="font-semibold text-white">{dept}</p>
                    <p className="text-xs text-slate-400">{test.endpoint}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    test.status === 'working' ? 'bg-emerald-500/20 text-emerald-300' :
                    test.status === 'error' ? 'bg-red-500/20 text-red-300' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

