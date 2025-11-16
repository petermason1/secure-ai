'use client';

import { useState } from 'react';

export default function SQLRunner() {
  const [sql, setSql] = useState(`-- Example: SELECT * FROM departments LIMIT 10;
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowDangerous, setAllowDangerous] = useState(false);

  const executeSQL = async () => {
    if (!sql.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/turso-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: sql.trim(),
          allowDangerous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'SQL execution failed');
        setResult(data);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute SQL');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/turso-sql');
      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const insertExample = (example: string) => {
    setSql(example);
  };

  const examples = [
    {
      name: 'List Tables',
      sql: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`,
    },
    {
      name: 'View Departments',
      sql: `SELECT * FROM departments LIMIT 10;`,
    },
    {
      name: 'View Agents',
      sql: `SELECT id, name, department_id, status FROM agents LIMIT 10;`,
    },
    {
      name: 'Count Tables',
      sql: `SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table';`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SQL Runner</h1>
        <p className="text-slate-400 mb-6">
          Execute SQL queries directly on your Turso database
        </p>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Quick Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => insertExample(example.sql)}
                className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Editor */}
        <div className="mb-4">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="w-full h-48 p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 font-mono text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Enter your SQL query here..."
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={executeSQL}
            disabled={loading || !sql.trim()}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Executing...' : '▶️ Execute SQL'}
          </button>

          <button
            onClick={loadTables}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 disabled:opacity-50"
          >
            📋 List Tables
          </button>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={allowDangerous}
              onChange={(e) => setAllowDangerous(e.target.checked)}
              className="rounded"
            />
            Allow DROP/TRUNCATE
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 font-semibold">Error:</p>
            <p className="text-red-300 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Results</h2>
              {result.success && (
                <div className="text-sm text-slate-400">
                  {result.row_count} row{result.row_count !== 1 ? 's' : ''}
                  {result.rows_affected > 0 && ` • ${result.rows_affected} affected`}
                </div>
              )}
            </div>

            {result.success && result.rows && result.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-slate-900 rounded-lg border border-slate-700">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {result.columns && result.columns.length > 0 ? (
                        result.columns.map((col: string, idx: number) => (
                          <th
                            key={idx}
                            className="px-4 py-2 text-left text-sm font-semibold text-slate-300"
                          >
                            {col}
                          </th>
                        ))
                      ) : (
                        Object.keys(result.rows[0] || {}).map((key, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-2 text-left text-sm font-semibold text-slate-300"
                          >
                            {key}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row: any, rowIdx: number) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        {Object.values(row).map((cell: any, cellIdx: number) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-2 text-sm text-slate-300"
                          >
                            {cell === null ? (
                              <span className="text-slate-500 italic">NULL</span>
                            ) : typeof cell === 'object' ? (
                              <pre className="text-xs">
                                {JSON.stringify(cell, null, 2)}
                              </pre>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : result.success ? (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-slate-400">
                Query executed successfully. No rows returned.
              </div>
            ) : (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <pre className="text-sm text-slate-300 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h3 className="font-semibold mb-2 text-slate-300">💡 Tips:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
            <li>Use SELECT queries to view data</li>
            <li>Use INSERT/UPDATE to modify data</li>
            <li>DANGEROUS operations (DROP/TRUNCATE) require checkbox</li>
            <li>Results are limited to prevent large outputs</li>
            <li>All queries are executed directly on Turso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

