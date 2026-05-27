import { useCallback, useEffect, memo, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Pagination } from '@shared';
import { useImport } from '../hooks/useImport';

const MB  = 1024 * 1024;
const fmt = (b) => b >= MB ? `${(b / MB).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

function StatusBadge({ status }) {
  const map = {
    completed:               { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed'     },
    completed_with_warnings: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'With Warnings' },
    failed:                  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Failed'        },
  };
  const s = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function Tile({ label, value, color }) {
  return (
    <div className={`flex-1 min-w-[90px] bg-gray-50 rounded-xl p-3 border-t-4 ${color}`}>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function IssueList({ items, type }) {
  if (!items?.length) return null;
  const isErr = type === 'error';
  return (
    <div className={`rounded-xl p-4 mb-3 ${isErr ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <div className={`font-semibold text-sm mb-2 flex items-center gap-2 ${isErr ? 'text-red-700' : 'text-yellow-700'}`}>
        {isErr ? <X className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {isErr
          ? `${items.length} Error${items.length !== 1 ? 's' : ''}`
          : `${items.length} Warning${items.length !== 1 ? 's' : ''}`}
      </div>
      <div className="max-h-52 overflow-y-auto space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`text-xs py-1 border-b last:border-0 ${isErr ? 'border-red-100 text-red-700' : 'border-yellow-100 text-yellow-700'}`}>
            {item.row   && <strong>Row {item.row} </strong>}
            {item.field && <span className="font-medium">[{item.field}] </span>}
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Memoized table — only re-renders when logs/meta/loading change ────
const ImportHistoryTable = memo(function ImportHistoryTable({ logs, logsMeta, logsLoading, onPageChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3">
        <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Import History</p>
      </div> */}

      {logsLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
          <Clock className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">No imports yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-700 to-cyan-800">
                  {['File', 'Uploaded', 'Total', 'Inserted', 'Updated', 'Skipped', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-cyan-200 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-cyan-50/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-cyan-700 max-w-[180px] truncate" title={log.file_name}>
                      {log.file_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.total_rows}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{log.inserted}</td>
                    <td className="px-4 py-3 font-semibold text-teal-700">{log.updated}</td>
                    <td className="px-4 py-3 text-yellow-700">{log.skipped}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={logsMeta.page}
            totalPages={logsMeta.totalPages}
            onChange={onPageChange}
          />
        </>
      )}
    </div>
  );
});

export default function ImportPage() {
  const {
    file, selectFile, clearFile,
    uploading, uploadFile,
    result, error,
    logs, logsMeta, logsLoading, fetchLogs,
  } = useImport();

  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { fetchLogs({ page: 1 }); }, [fetchLogs]);

  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  }, [selectFile]);

  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = '';
  }, [selectFile]);

  // Stable callback for pagination — won't cause ImportHistoryTable to re-render
  const handlePageChange = useCallback((page) => {
    fetchLogs({ page });
  }, [fetchLogs]);

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-600/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-500/20 pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-32 h-32 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
                <Upload className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Import Employees</h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              Upload an Excel file to bulk-insert or update employee records.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <FileSpreadsheet className="w-8 h-8 text-cyan-400/60" />
          </div>
        </div>
      </div>

      {/* ── Warning notice ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
        <span>
          <strong>Important:</strong> Employees present in the database but{' '}
          <strong>absent from the uploaded file will be automatically deactivated.</strong>{' '}
          Ensure the file contains your complete active headcount before uploading.
        </span>
      </div>

      {/* ── Upload card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3">
          <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Upload File</p>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-cyan-600" />
                </div>
                <p className="font-semibold text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">{fmt(file.size)}</p>
                <button
                  className="mt-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">Drag & drop your Excel file here</p>
                <p className="text-xs text-gray-400">or click to browse · .xlsx / .xls · max 5 MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              disabled={uploading || !file}
              onClick={uploadFile}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                uploading || !file
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Import
                </>
              )}
            </button>
            {file && !uploading && (
              <button
                onClick={clearFile}
                className="px-5 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Result card ───────────────────────────────────────────────── */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Import Result</p>
            <StatusBadge
              status={result.errors?.length || result.warnings?.length ? 'completed_with_warnings' : 'completed'}
            />
          </div>
          <div className="p-6">
            <p className="text-xs text-gray-500 mb-4">{result.message}</p>
            <div className="flex gap-2 flex-wrap mb-4">
              <Tile label="Total Rows"  value={result.summary.total_rows_in_file}       color="border-cyan-600"   />
              <Tile label="Inserted"    value={result.summary.inserted}                 color="border-green-600"  />
              <Tile label="Updated"     value={result.summary.updated}                  color="border-teal-600"   />
              <Tile label="Skipped"     value={result.summary.skipped}                  color="border-yellow-500" />
              <Tile label="Deactivated" value={result.summary.deactivated ?? 0}         color="border-red-500"    />
              <Tile label="→ Manager"   value={result.summary.promoted_to_manager ?? 0} color="border-purple-500" />
              <Tile label="→ Employee"  value={result.summary.demoted_to_employee ?? 0} color="border-gray-400"   />
            </div>
            <IssueList items={result.errors}   type="error"   />
            <IssueList items={result.warnings} type="warning" />
            {!result.errors?.length && !result.warnings?.length && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                All rows imported cleanly with no errors or warnings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Import history — memoized, won't re-render with upload state ─ */}
      <ImportHistoryTable
        logs={logs}
        logsMeta={logsMeta}
        logsLoading={logsLoading}
        onPageChange={handlePageChange}
      />

    </div>
  );
}