import { useCallback, useState } from 'react';
import api from '@shared/services/api';

export function useImport() {
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Logs state merged into one object so pagination updates
  //    are a single setState call → single re-render ──────────────────
  const [logsState, setLogsState] = useState({
    logs:     [],
    logsMeta: { page: 1, totalPages: 1, total: 0 },
  });

  const selectFile = useCallback((f) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const fetchLogs = useCallback(async ({ page = 1 } = {}) => {
    setLogsLoading(true);
    try {
      const { data } = await api.get('/import/logs', { params: { page, limit: 10 } });
      // Single setState → single re-render for the table section
      setLogsState({
        logs: data.data,
        logsMeta: {
          page:       data.meta.page,
          totalPages: data.meta.totalPages,
          total:      data.meta.total,
        },
      });
    } catch {
      // Non-critical — log failure should not block upload UI
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/import/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setFile(null);
      fetchLogs({ page: 1 });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [file, fetchLogs]); // fetchLogs is stable (useCallback + no deps) so safe to include

  return {
    file, selectFile, clearFile,
    uploading, uploadFile,
    result, error,
    logs:        logsState.logs,
    logsMeta:    logsState.logsMeta,
    logsLoading, fetchLogs,
  };
}