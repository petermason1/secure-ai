/**
 * Big Technical Execution Engine - Tier 1: Invoice Processor
 * 
 * Feature: Intelligent Document Classifier & Data Extractor
 * Component: DocumentProcessor.tsx
 * 
 * This is a self-contained React component for processing PDF invoices.
 * It handles:
 * - Drag-and-drop PDF upload
 * - Real-time processing status
 * - Structured data extraction display
 * - Manual override/correction UI
 * - Routing status (auto-pay vs manager review)
 * 
 * Usage:
 *   import DocumentProcessor from '@/app/components/DocumentProcessor';
 *   <DocumentProcessor />
 */

'use client';

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ExtractedData {
  document_type: string;
  document_id: string;
  supplier_name: string;
  invoice_date: string;
  due_date: string;
  total_amount_due: number;
  currency: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  validation_status: boolean;
  validation_flag_reason: string;
}

interface ProcessingStatus {
  stage: 'idle' | 'uploading' | 'parsing' | 'extracting' | 'routing' | 'complete' | 'error';
  message: string;
  progress?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DocumentProcessor() {
  // State: Selected file
  const [file, setFile] = useState<File | null>(null);
  
  // State: Processing status
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    message: 'Ready to upload invoice',
  });
  
  // State: Extracted data
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  
  // State: Document ID (for tracking)
  const [documentId, setDocumentId] = useState<string | null>(null);
  
  // State: Routing status
  const [routingStatus, setRoutingStatus] = useState<'READY_FOR_AUTO_PAY' | 'PENDING_MANAGER_REVIEW' | null>(null);
  
  // State: Drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle file selection (from input or drag-drop)
   */
  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setStatus({
        stage: 'error',
        message: 'Please upload a PDF file',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus({
        stage: 'error',
        message: 'File size must be less than 10MB',
      });
      return;
    }

    setFile(selectedFile);
    setStatus({
      stage: 'idle',
      message: `Selected: ${selectedFile.name}`,
    });
    setExtractedData(null);
    setRoutingStatus(null);
  }, []);

  /**
   * Handle drag and drop
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  /**
   * Process the uploaded document
   */
  async function handleProcess() {
    if (!file) return;

    try {
      // Step 1: Upload file
      setStatus({ stage: 'uploading', message: 'Uploading PDF...', progress: 10 });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Step 2: Parse response
      setStatus({ stage: 'parsing', message: 'Parsing document...', progress: 30 });

      const result = await response.json();

      // Step 3: Extract data
      setStatus({ stage: 'extracting', message: 'Extracting structured data...', progress: 60 });

      if (!result.extracted_data) {
        throw new Error('No extracted data received');
      }

      setExtractedData(result.extracted_data);
      setDocumentId(result.document_id);
      setRoutingStatus(result.routing_status);

      // Step 4: Complete
      setStatus({
        stage: 'complete',
        message: 'Processing complete!',
        progress: 100,
      });
    } catch (error) {
      setStatus({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Processing failed',
      });
    }
  }

  /**
   * Reset component state
   */
  function handleReset() {
    setFile(null);
    setExtractedData(null);
    setDocumentId(null);
    setRoutingStatus(null);
    setStatus({
      stage: 'idle',
      message: 'Ready to upload invoice',
    });
  }

  /**
   * Manual override: Change routing status
   */
  async function handleManualOverride(newStatus: 'READY_FOR_AUTO_PAY' | 'PENDING_MANAGER_REVIEW') {
    if (!documentId) return;

    try {
      const response = await fetch('/api/process-document/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          routing_status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Override failed');

      setRoutingStatus(newStatus);
      setStatus({
        stage: 'complete',
        message: 'Routing status updated',
      });
    } catch (error) {
      setStatus({
        stage: 'error',
        message: 'Failed to update routing status',
      });
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Invoice Processor
          </h1>
          <p className="mt-2 text-slate-400">
            Upload PDF invoices for automated data extraction and routing
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Upload & Status */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/20 bg-slate-800/60 hover:border-emerald-500/50'
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-emerald-400 hover:text-emerald-300"
                    >
                      Click to upload
                    </label>
                    <span className="text-slate-400"> or drag and drop</span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF files only, max 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Processing Status</h2>
              
              <div className="space-y-3">
                {/* Status Message */}
                <div>
                  <p className="text-sm text-slate-400">Current Stage</p>
                  <p className="mt-1 font-semibold text-white">{status.message}</p>
                </div>

                {/* Progress Bar */}
                {status.progress !== undefined && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-400">
                      <span>{status.stage}</span>
                      <span>{status.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Routing Status */}
                {routingStatus && (
                  <div className="mt-4 rounded-lg border p-3 ${
                    routingStatus === 'READY_FOR_AUTO_PAY'
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-amber-500/30 bg-amber-500/10'
                  }">
                    <p className="text-xs text-slate-400">Routing Status</p>
                    <p className="mt-1 font-semibold ${
                      routingStatus === 'READY_FOR_AUTO_PAY'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }">
                      {routingStatus === 'READY_FOR_AUTO_PAY'
                        ? '✓ Ready for Auto-Pay'
                        : '⚠ Pending Manager Review'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Process Button */}
            {file && status.stage !== 'complete' && status.stage !== 'error' && (
              <button
                onClick={handleProcess}
                disabled={status.stage !== 'idle' && status.stage !== 'error'}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.stage === 'idle' ? 'Process Invoice' : 'Processing...'}
              </button>
            )}
          </div>

          {/* Right Column: Extracted Data */}
          <div className="space-y-6">
            {extractedData ? (
              <>
                {/* Extracted Data Display */}
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Extracted Data</h2>
                    {documentId && (
                      <span className="text-xs text-slate-400">ID: {documentId.slice(0, 8)}</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Supplier</p>
                        <p className="mt-1 font-semibold text-white">
                          {extractedData.supplier_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Invoice Date</p>
                        <p className="mt-1 font-semibold text-white">
                          {extractedData.invoice_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Due Date</p>
                        <p className="mt-1 font-semibold text-white">
                          {extractedData.due_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Amount</p>
                        <p className="mt-1 text-lg font-bold text-emerald-400">
                          {extractedData.currency} {extractedData.total_amount_due.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Line Items */}
                    {extractedData.line_items.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-slate-400">Line Items</p>
                        <div className="space-y-2 rounded-lg border border-white/5 bg-slate-900/40 p-3">
                          {extractedData.line_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-300">{item.description}</span>
                              <span className="font-semibold text-white">
                                {extractedData.currency} {item.line_total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Status */}
                    <div className={`rounded-lg border p-3 ${
                      extractedData.validation_status
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-red-500/30 bg-red-500/10'
                    }`}>
                      <p className="text-xs text-slate-400">Validation</p>
                      <p className={`mt-1 font-semibold ${
                        extractedData.validation_status
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {extractedData.validation_status ? '✓ Valid' : '✗ Flagged'}
                      </p>
                      {!extractedData.validation_status && (
                        <p className="mt-1 text-xs text-slate-300">
                          {extractedData.validation_flag_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Override */}
                {routingStatus && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/60 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-white">Manual Override</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleManualOverride('READY_FOR_AUTO_PAY')}
                        className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        Mark Auto-Pay
                      </button>
                      <button
                        onClick={() => handleManualOverride('PENDING_MANAGER_REVIEW')}
                        className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20"
                      >
                        Require Review
                      </button>
                    </div>
                  </div>
                )}

                {/* JSON View (Collapsible) */}
                <details className="rounded-xl border border-white/10 bg-slate-800/60">
                  <summary className="cursor-pointer p-4 text-sm font-semibold text-white">
                    View Raw JSON
                  </summary>
                  <pre className="overflow-x-auto p-4 text-xs text-slate-300">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-800/60 p-12 text-center">
                <p className="text-slate-400">Extracted data will appear here after processing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
