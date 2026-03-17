import { useCallback, useEffect, useRef, useState } from 'react';
import { useImport } from '../hooks/useImport';

const MB  = 1024 * 1024;
const fmt = (b) => b >= MB ? `${(b / MB).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed:               { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Completed'     },
    completed_with_warnings: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'With warnings' },
    failed:                  { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Failed'        },
  };
  const s = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ── Summary tile ──────────────────────────────────────────────────────────────
function Tile({ label, value, color }) {
  return (
    <div className={`flex-1 min-w-[90px] bg-gray-50 rounded-lg p-3 border-t-4 ${color}`}>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

// ── Issue list ────────────────────────────────────────────────────────────────
function IssueList({ items, type }) {
  if (!items?.length) return null;
  const isErr = type === 'error';
  return (
    <div className={`rounded-lg p-4 mb-3 ${isErr ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <div className={`font-semibold text-sm mb-2 ${isErr ? 'text-red-800' : 'text-yellow-800'}`}>
        {isErr ? `❌ ${items.length} Error${items.length !== 1 ? 's' : ''}` : `⚠️ ${items.length} Warning${items.length !== 1 ? 's' : ''}`}
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

// ── Main page ─────────────────────────────────────────────────────────────────
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

  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  }, [selectFile]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Import Employees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload an Excel file to bulk-insert or update employee records.{' '}
        </p>

        {/* Soft-delete notice */}
        <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <span className="mt-0.5 flex-shrink-0">⚠️</span>
          <span>
            <strong>Important:</strong> Employees present in the database but{' '}
            <strong>absent from the uploaded file will be automatically deactivated.</strong>{' '}
            Ensure the file contains your complete active headcount before uploading.
          </span>
        </div>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Upload File</h2>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
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
            onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f); }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📄</span>
              <p className="font-semibold text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-400">{fmt(file.size)}</p>
              <button
                className="mt-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-3 py-1 hover:bg-red-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📂</span>
              <p className="font-medium text-gray-600">Drag & drop your Excel file here</p>
              <p className="text-xs text-gray-400">or click to browse · .xlsx / .xls · max 5 MB</p>
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            disabled={uploading || !file}
            onClick={uploadFile}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors
              ${uploading || !file
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-700 text-white hover:bg-blue-800'}`}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading…
              </span>
            ) : 'Upload & Import'}
          </button>

          {file && !uploading && (
            <button
              onClick={clearFile}
              className="px-5 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Import Result</h2>
            <StatusBadge status={result.errors?.length || result.warnings?.length ? 'completed_with_warnings' : 'completed'} />
          </div>
          <p className="text-xs text-gray-500 mb-4">{result.message}</p>

          {/* Summary tiles */}
          <div className="flex gap-2 flex-wrap mb-4">
            <Tile label="Total Rows"         value={result.summary.total_rows_in_file}       color="border-blue-700"   />
            <Tile label="Inserted"           value={result.summary.inserted}                 color="border-green-600"  />
            <Tile label="Updated"            value={result.summary.updated}                  color="border-teal-600"   />
            <Tile label="Skipped"            value={result.summary.skipped}                  color="border-yellow-500" />
            <Tile label="Deactivated"        value={result.summary.deactivated ?? 0}         color="border-red-600"    />
            <Tile label="→ Manager"          value={result.summary.promoted_to_manager ?? 0} color="border-purple-600" />
            <Tile label="→ Employee"         value={result.summary.demoted_to_employee ?? 0} color="border-gray-400"   />
          </div>

          <IssueList items={result.errors}   type="error"   />
          <IssueList items={result.warnings} type="warning" />

          {!result.errors?.length && !result.warnings?.length && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
              ✅ All rows imported cleanly with no errors or warnings.
            </div>
          )}
        </div>
      )}

      {/* Import history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Import History</h2>
          <button
            onClick={() => fetchLogs({ page: logsMeta.page })}
            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-3 py-1 hover:bg-blue-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {logsLoading ? (
          <div className="text-center py-8 text-sm text-gray-400">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">No imports yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    {['File', 'Uploaded', 'Total', 'Inserted', 'Updated', 'Skipped', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold border-b border-gray-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-blue-700 max-w-[180px] truncate" title={log.file_name}>
                        {log.file_name}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">{log.total_rows}</td>
                      <td className="px-3 py-2.5 font-semibold text-green-700">{log.inserted}</td>
                      <td className="px-3 py-2.5 font-semibold text-teal-700">{log.updated}</td>
                      <td className="px-3 py-2.5 text-yellow-700">{log.skipped}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logsMeta.totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  disabled={logsMeta.page === 1}
                  onClick={() => fetchLogs({ page: logsMeta.page - 1 })}
                  className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page {logsMeta.page} / {logsMeta.totalPages}
                </span>
                <button
                  disabled={logsMeta.page === logsMeta.totalPages}
                  onClick={() => fetchLogs({ page: logsMeta.page + 1 })}
                  className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}