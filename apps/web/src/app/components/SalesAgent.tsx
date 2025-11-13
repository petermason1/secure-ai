/**
 * Big Technical Execution Engine - Tier 2: Sales Automation Agent
 * 
 * Component: SalesAgent.tsx
 * 
 * This component handles:
 * - Lead input form
 * - Job triggering (async)
 * - Status polling (using get_job_status)
 * - Results display
 * - Mobile-responsive Tailwind CSS
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface LeadInput {
  lead_name: string;
  company_context: string;
}

interface JobStatus {
  status: 'TRIGGERED' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  last_log: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SalesAgent() {
  // State: Lead input form
  const [leadInput, setLeadInput] = useState<LeadInput>({
    lead_name: '',
    company_context: '',
  });

  // State: Current job
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling interval ref
  const pollingIntervalRef = useState<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Trigger the sales agent job
   */
  async function handleTrigger() {
    if (!leadInput.lead_name.trim() || !leadInput.company_context.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsTriggering(true);
    setError(null);
    setJobStatus(null);

    try {
      const response = await fetch('/api/sales-agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadInput),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus({ status: 'TRIGGERED', last_log: 'Job has been accepted and is waiting to run.' });

      // Start polling immediately
      startPolling(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger job');
      setIsTriggering(false);
    }
  }

  /**
   * Poll for job status
   */
  const pollStatus = useCallback(async (currentJobId: string) => {
    try {
      const response = await fetch(`/api/sales-agent/status?job_id=${currentJobId}`);
      if (!response.ok) return;

      const status: JobStatus = await response.json();
      setJobStatus(status);

      // Stop polling if job is complete or failed
      if (status.status === 'COMPLETE' || status.status === 'FAILED') {
        stopPolling();
        setIsTriggering(false);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, []);

  /**
   * Start polling interval
   */
  function startPolling(jobIdToPoll: string) {
    // Poll immediately
    pollStatus(jobIdToPoll);

    // Then poll every 2 seconds
    const interval = setInterval(() => {
      pollStatus(jobIdToPoll);
    }, 2000);

    pollingIntervalRef[0] = interval;
  }

  /**
   * Stop polling
   */
  function stopPolling() {
    if (pollingIntervalRef[0]) {
      clearInterval(pollingIntervalRef[0]);
      pollingIntervalRef[0] = null;
    }
  }

  /**
   * Reset form and state
   */
  function handleReset() {
    stopPolling();
    setJobId(null);
    setJobStatus(null);
    setLeadInput({ lead_name: '', company_context: '' });
    setError(null);
    setIsTriggering(false);
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Sales Automation Agent
          </h1>
          <p className="mt-2 text-slate-400">
            Enter lead information to trigger automated CRM and email actions
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input Form */}
          <div className="space-y-6">
            {/* Lead Input Form */}
            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Lead Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="lead_name" className="mb-2 block text-sm font-medium text-slate-300">
                    Lead Name *
                  </label>
                  <input
                    id="lead_name"
                    type="text"
                    value={leadInput.lead_name}
                    onChange={(e) =>
                      setLeadInput({ ...leadInput, lead_name: e.target.value })
                    }
                    placeholder="e.g., Strategic Client"
                    disabled={isTriggering || jobId !== null}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="company_context" className="mb-2 block text-sm font-medium text-slate-300">
                    Company Context *
                  </label>
                  <textarea
                    id="company_context"
                    value={leadInput.company_context}
                    onChange={(e) =>
                      setLeadInput({ ...leadInput, company_context: e.target.value })
                    }
                    placeholder="e.g., Fintech with high growth, confirmed budget for automation £100k"
                    rows={6}
                    disabled={isTriggering || jobId !== null}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {!jobId ? (
                  <button
                    onClick={handleTrigger}
                    disabled={isTriggering}
                    className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTriggering ? 'Triggering...' : 'Trigger Sales Agent'}
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Status Display */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Job Status</h2>

              {!jobStatus ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No job running</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div>
                    <p className="mb-2 text-xs text-slate-400">Current Status</p>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        jobStatus.status === 'COMPLETE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : jobStatus.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-400'
                          : jobStatus.status === 'PROCESSING'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {jobStatus.status === 'PROCESSING' && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
                      )}
                      {jobStatus.status}
                    </div>
                  </div>

                  {/* Job ID */}
                  {jobId && (
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Job ID</p>
                      <p className="font-mono text-sm text-slate-300">{jobId}</p>
                    </div>
                  )}

                  {/* Last Log */}
                  <div>
                    <p className="mb-1 text-xs text-slate-400">Last Update</p>
                    <p className="text-sm text-slate-300">{jobStatus.last_log}</p>
                  </div>

                  {/* Processing Indicator */}
                  {(jobStatus.status === 'TRIGGERED' || jobStatus.status === 'PROCESSING') && (
                    <div className="pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                        Polling for updates...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-300">How It Works</h3>
              <ul className="space-y-1 text-xs text-emerald-200/80">
                <li>• AI analyzes the lead and assigns a score</li>
                <li>• Rule-based routing determines actions</li>
                <li>• High-value leads trigger CRM + Email</li>
                <li>• Low-value leads trigger CRM only</li>
                <li>• All actions are logged for audit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
