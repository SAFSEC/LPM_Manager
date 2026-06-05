import { useState, useCallback, useEffect } from 'react';
import { unwrapIpc, IpcError } from '@/lib/ipc';

export interface ExportRecord {
  id: number;
  mandantId: string;
  typ: string;
  referenzId: number;
  format: string;
  dateiname: string;
  dateipfad: string;
  erstelltAm: string;
}

interface ExportState {
  loading: boolean;
  error: string | null;
  letzterExport: { dateiname: string; dateipfad: string } | null;
}

const initialState: ExportState = { loading: false, error: null, letzterExport: null };

export function useExport(mandantId: string | null) {
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [wordState, setWordState] = useState<ExportState>(initialState);
  const [pdfState, setPdfState] = useState<ExportState>(initialState);

  const ladeHistory = useCallback(async () => {
    if (!mandantId) {
      setExportHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await window.lpm.export.liste({ mandant_id: mandantId });
      const data = unwrapIpc(res);
      setExportHistory(data as ExportRecord[]);
    } catch {
      setExportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [mandantId]);

  useEffect(() => {
    void ladeHistory();
  }, [ladeHistory]);

  const exportWord = useCallback(
    async (runId: number) => {
      if (!mandantId) return;
      setWordState({ loading: true, error: null, letzterExport: null });
      try {
        const res = await window.lpm.export.word({
          typ: 'checkliste',
          referenz_id: runId,
          mandant_id: mandantId,
        });
        const data = unwrapIpc(res);
        setWordState({ loading: false, error: null, letzterExport: data as { dateiname: string; dateipfad: string } });
        await ladeHistory();
      } catch (err) {
        const msg = err instanceof IpcError ? err.message : 'Word-Export fehlgeschlagen';
        setWordState({ loading: false, error: msg, letzterExport: null });
      }
    },
    [mandantId, ladeHistory]
  );

  const exportPdf = useCallback(
    async (runId: number) => {
      if (!mandantId) return;
      setPdfState({ loading: true, error: null, letzterExport: null });
      try {
        const res = await window.lpm.export.pdf({
          typ: 'checkliste',
          referenz_id: runId,
          mandant_id: mandantId,
        });
        const data = unwrapIpc(res);
        setPdfState({ loading: false, error: null, letzterExport: data as { dateiname: string; dateipfad: string } });
        await ladeHistory();
      } catch (err) {
        const msg = err instanceof IpcError ? err.message : 'PDF-Export fehlgeschlagen';
        setPdfState({ loading: false, error: msg, letzterExport: null });
      }
    },
    [mandantId, ladeHistory]
  );

  const dateiOeffnen = useCallback(async (dateipfad: string) => {
    try {
      await window.lpm.export.dateiOeffnen({ dateipfad });
    } catch {
      // ignore
    }
  }, []);

  const ordnerOeffnen = useCallback(async () => {
    try {
      await window.lpm.export.ordnerOeffnen();
    } catch {
      // ignore
    }
  }, []);

  return {
    exportHistory,
    historyLoading,
    wordState,
    pdfState,
    exportWord,
    exportPdf,
    dateiOeffnen,
    ordnerOeffnen,
    ladeHistory,
  };
}
