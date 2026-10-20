import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Server, Database, Key, CheckCircle, AlertCircle, 
  Play, RefreshCw, Layers, Cpu, Lock, History as HistoryIcon, Wrench, 
  FileText, Check, X, ChevronRight, User, Terminal
} from 'lucide-react';

interface RunItem {
  run_id: string;
  tenant_id: string;
  operator_email: string;
  status: string;
  record_count: number;
  quality_score_avg: number;
  created_at: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tools' | 'history'>('tools');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  );
  
  // Auth state
  const [authToken, setAuthToken] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('44444444-4444-4444-4444-444444444444');
  const [userEmail, setUserEmail] = useState<string>('operator@pro-tenant.com');
  const [userRole, setUserRole] = useState<string>('Operator');
  
  // Run Tools state
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [batchInput, setBatchInput] = useState<string>(JSON.stringify([
    { record_id: "REC-01", email: "alice@example.com", credit_limit: 5000, status: "ACTIVE" },
    { record_id: "REC-02", email: "bob@example.com", credit_limit: 12000, status: "INACTIVE" }
  ], null, 2));
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [processResult, setProcessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History state
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runDetail, setRunDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Helper to generate dev token
  const handleGenerateToken = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, email: userEmail, role: userRole })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Token generation failed');
      }
      const data = await res.json();
      setAuthToken(data.access_token);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    if (!authToken) {
      setErrorMsg('Please generate or provide a Bearer auth token first.');
      return;
    }
    setHistoryLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${apiBaseUrl}/runs`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch run history');
      }
      const data = await res.json();
      setRuns(data.runs || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && authToken) {
      fetchHistory();
    }
  }, [activeTab]);

  // Fetch Run Detail
  const fetchRunDetail = async (runId: string) => {
    if (!authToken) return;
    setSelectedRunId(runId);
    setDetailLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/runs/${runId}/result`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch run details');
      }
      const data = await res.json();
      setRunDetail(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Run Validate
  const handleValidate = async () => {
    setActionLoading(true);
    setValidationResult(null);
    setProcessResult(null);
    setErrorMsg(null);
    try {
      const parsedRecords = JSON.parse(batchInput);
      const res = await fetch(`${apiBaseUrl}/runs/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ records: parsedRecords })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
      setValidationResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Run Process (Pro)
  const handleProcess = async () => {
    if (!authToken) {
      setErrorMsg('Authentication token required for processing.');
      return;
    }
    setActionLoading(true);
    setValidationResult(null);
    setProcessResult(null);
    setErrorMsg(null);
    try {
      const parsedRecords = JSON.parse(batchInput);
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      if (idempotencyKey.trim()) {
        headers['Idempotency-Key'] = idempotencyKey.trim();
      }

      const res = await fetch(`${apiBaseUrl}/runs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records: parsedRecords })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
      setProcessResult(data);
      if (activeTab === 'history') {
        fetchHistory();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header & Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                UC-01 Customer Data Quality SaaS
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Module 3 UI
                </span>
              </h1>
              <p className="text-xs text-slate-400">React + FastAPI + Azure SQL + Validation R1-R4</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('tools')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tools' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Run Tools</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'history' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HistoryIcon className="h-3.5 w-3.5" />
              <span>History</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Auth Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">Authentication & Tenant Context</div>
              <div className="text-slate-400 font-mono">Tenant: {tenantId.substring(0,8)}... | Role: {userRole}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <input 
              type="text"
              placeholder="Tenant ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 w-36 font-mono text-xs"
            />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-medium"
            >
              <option value="Operator">Operator (Pro)</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              onClick={handleGenerateToken}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition shadow-sm"
            >
              Generate Dev Token
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-start space-x-3 text-rose-200">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Error Response</h3>
              <p className="text-xs text-rose-300 mt-1 font-mono whitespace-pre-wrap">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* TAB 1: RUN TOOLS */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  Batch Record Input (1–10 Records)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Supports R1 (<code className="text-blue-400">record_id</code>), R2 (<code className="text-blue-400">email</code>), R3 (<code className="text-blue-400">credit_limit</code>), and R4 (<code className="text-blue-400">status</code>).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Idempotency-Key Header (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. idempotency-key-uuid-123"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Records (JSON Array)</label>
                <textarea
                  rows={10}
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  onClick={handleValidate}
                  disabled={actionLoading}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700 shadow-md"
                >
                  {actionLoading ? 'Validating...' : 'Validate Batch (/runs/validate)'}
                </button>
                <button
                  onClick={handleProcess}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                >
                  {actionLoading ? 'Processing...' : 'Process Batch (Pro /runs)'}
                </button>
              </div>
            </div>

            {/* Right: Results Display */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between font-sans">
              <div>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  Execution Results & Validation Issues
                </h2>

                {validationResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Valid Rows</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{validationResult.valid_count}</div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Invalid Rows</div>
                        <div className="text-xl font-bold text-rose-400 mt-1">{validationResult.invalid_count}</div>
                      </div>
                    </div>

                    {validationResult.issues?.length > 0 ? (
                      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 space-y-2">
                        <div className="text-xs font-semibold text-rose-300">Rule Violations (R1–R4):</div>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {validationResult.issues.map((issue: any, idx: number) => (
                            <div key={idx} className="bg-slate-950/80 p-2 rounded-lg border border-rose-900/50 text-xs flex justify-between items-center font-mono">
                              <div>
                                <span className="text-rose-400 font-bold">Row {issue.row_index}</span> ({issue.field}): <span className="text-slate-300">{issue.message}</span>
                              </div>
                              <span className="text-[10px] bg-rose-900/50 text-rose-200 px-2 py-0.5 rounded">{issue.rule_id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-emerald-300 text-xs flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>All records passed validation successfully (0 issues).</span>
                      </div>
                    )}
                  </div>
                )}

                {processResult && (
                  <div className="space-y-4">
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-emerald-400">Run Accepted & Processed Successfully</div>
                        <div className="text-[10px] font-mono text-slate-400">Run ID: {processResult.run_id}</div>
                      </div>
                      <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {processResult.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-300">Input Rows (Normalized):</div>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                        {JSON.stringify(processResult.input_rows, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-300">Contactable Rows (ACTIVE status):</div>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-40">
                        {JSON.stringify(processResult.contactable_rows, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {!validationResult && !processResult && (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                    <Terminal className="h-8 w-8 opacity-40" />
                    <p>Run a batch validation or Pro processing request to view structured output results here.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
                <span>UC-01 Customer Data Quality SaaS</span>
                <span>Module 3 UI</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Runs List */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-blue-400" />
                    Tenant Run History
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Retrieved via <code className="text-blue-400">GET /runs</code></p>
                </div>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-2">Run ID</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Records</th>
                      <th className="py-3 px-2">Created At</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {runs.map((r) => (
                      <tr key={r.run_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-2 font-mono text-slate-300">{r.run_id.substring(0, 8)}...</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">{r.record_count}</td>
                        <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => fetchRunDetail(r.run_id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition text-[11px]"
                          >
                            <span>View</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {runs.length === 0 && !historyLoading && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                          No run history found for this tenant.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Run Detail Inspector */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between font-sans">
              <div>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Run Result Inspector
                </h2>

                {detailLoading ? (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                    Loading run results...
                  </div>
                ) : runDetail ? (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[10px]">RUN ID</div>
                      <div className="text-slate-200 text-xs break-all">{runDetail.run_id}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 text-[10px]">STATUS</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{runDetail.status}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 text-[10px]">RECORDS</div>
                        <div className="text-slate-200 font-bold mt-0.5">{runDetail.record_count}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-400 text-[10px]">INPUT ROWS</div>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 max-h-36 overflow-x-auto">
                        {JSON.stringify(runDetail.input_rows, null, 2)}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-400 text-[10px]">CONTACTABLE ROWS</div>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-emerald-300 max-h-36 overflow-x-auto">
                        {JSON.stringify(runDetail.contactable_rows, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                    <FileText className="h-8 w-8 opacity-40" />
                    <p>Select a run from the history table on the left to inspect its complete execution results.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                <span>Module 3 History & Inspector</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
