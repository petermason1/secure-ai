'use client';

import { useState } from 'react';

export default function TestTurso() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/turso-test');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPOST = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/turso-test', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/turso-migrate', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/turso-migrate', {
        method: 'GET',
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Turso Connection</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={testPOST}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test POST'}
          </button>
          <button
            onClick={checkTables}
            disabled={loading}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-400 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Tables'}
          </button>
          <button
            onClick={runMigrations}
            disabled={loading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? 'Running...' : '🚀 Run Migrations'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 font-semibold">Error:</p>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <pre className="p-4 bg-slate-900 rounded-lg border border-slate-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-slate-900 rounded-lg">
          <h3 className="font-semibold mb-2">What to check:</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>✅ Success: true means Turso is connected</li>
            <li>✅ Data shows your query results</li>
            <li>❌ Error about missing env vars = need to add to .env.local</li>
            <li>❌ Connection error = check database URL and token</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

