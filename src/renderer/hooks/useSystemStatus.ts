import { useEffect, useState } from 'react';
import { IpcError, unwrapIpc } from '@/lib/ipc';

interface DbPaths {
  mainDb: string;
  tokensDb: string;
}

export function useSystemStatus(): {
  dbPaths: DbPaths | null;
  loading: boolean;
  error: string | null;
} {
  const [dbPaths, setDbPaths] = useState<DbPaths | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const result = await window.lpm.system.getDbPaths();
        const paths = unwrapIpc(result);
        if (!cancelled) {
          setDbPaths(paths);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof IpcError ? err.message : 'Systemstatus nicht verfügbar');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { dbPaths, loading, error };
}

function shortenPath(fullPath: string): string {
  const parts = fullPath.replace(/\\/g, '/').split('/');
  if (parts.length <= 3) {
    return fullPath;
  }
  return `…/${parts.slice(-2).join('/')}`;
}

export { shortenPath };
