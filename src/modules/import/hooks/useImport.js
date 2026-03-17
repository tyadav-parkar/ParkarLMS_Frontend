import { useCallback, useState } from 'react';
import api from '@shared/services/api';

export function useImport() {
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);

  const [logs,        setLogs]        = useState([]);
  const [logsMeta,    setLogsMeta]    = useState({ page: 1, totalPages: 1, total: 0 });
  const [logsLoading, setLogsLoading] = useState(false);

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
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = useCallback(async ({ page = 1 } = {}) => {
    setLogsLoading(true);
    try {
      const { data } = await api.get('/import/logs', { params: { page, limit: 10 } });
      setLogs(data.data);
      setLogsMeta({
        page:       data.meta.page,
        totalPages: data.meta.totalPages,
        total:      data.meta.total,
      });
    } catch {
      // Non-critical — log failure should not block upload UI
    } finally {
      setLogsLoading(false);
    }
  }, []);

  return {
    file, selectFile, clearFile,
    uploading, uploadFile,
    result, error,
    logs, logsMeta, logsLoading, fetchLogs,
  };
}