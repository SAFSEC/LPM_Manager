import { useState, useEffect, useCallback } from 'react';
import { useMandant } from '@/context/MandantContext';
import { useExport } from '@/hooks/useExport';
import { unwrapIpc } from '@/lib/ipc';
import { ExportRunCard } from '@/components/export/ExportRunCard';
import { ExportHistoryTable } from '@/components/export/ExportHistoryTable';

interface ChecklisteRun {
  id: number;
  mandantId: string;
  anlageId: string;
  anlageName: string;
  status: string;
  kiZusammenfassung: string | null;
  abgeschlossenAm: string | null;
  erstelltAm: string;
}

export default function ExportPage(): JSX.Element {
  const { activeMandant } = useMandant();
  const mandantId = activeMandant?.mandant_id ?? null;

  const {
    exportHistory,
    historyLoading,
    wordState,
    pdfState,
    exportWord,
    exportPdf,
    dateiOeffnen,
    ordnerOeffnen,
  } = useExport(mandantId);

  const [runs, setRuns] = useState<ChecklisteRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);

  const ladeRuns = useCallback(async () => {
    if (!mandantId) {
      setRuns([]);
      return;
    }
    setRunsLoading(true);
    try {
      const res = await window.lpm.checklisten.runsVonMandant({ mandant_id: mandantId });
      const data = unwrapIpc(res) as ChecklisteRun[];
      setRuns(data.filter((r) => r.status === 'abgeschlossen'));
    } catch {
      setRuns([]);
    } finally {
      setRunsLoading(false);
    }
  }, [mandantId]);

  useEffect(() => {
    void ladeRuns();
  }, [ladeRuns]);

  useEffect(() => {
    setSelectedRunId(null);
  }, [mandantId]);

  if (!activeMandant) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-500">Bitte zuerst einen Mandanten auswählen.</p>
      </div>
    );
  }

  const handleExportWord = async (runId: number) => {
    setExportingId(runId);
    await exportWord(runId);
    setExportingId(null);
  };

  const handleExportPdf = async (runId: number) => {
    setExportingId(runId);
    await exportPdf(runId);
    setExportingId(null);
  };

  const isExporting = wordState.loading || pdfState.loading;
  const exportError = wordState.error ?? pdfState.error;
  const letzterExport = wordState.letzterExport ?? pdfState.letzterExport;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Export</h1>
          <p className="mt-1 text-sm text-slate-500">
            Checklisten-Ergebnisse als Word (.docx) oder PDF exportieren
          </p>
        </div>
        <button
          onClick={ordnerOeffnen}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <FolderIcon />
          Export-Ordner öffnen
        </button>
      </div>

      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Fehler:</strong> {exportError}
        </div>
      )}

      {letzterExport && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">Export erfolgreich erstellt</p>
              <p className="mt-1 text-xs text-green-600">{letzterExport.dateiname}</p>
            </div>
            <button
              onClick={() => dateiOeffnen(letzterExport.dateipfad)}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              Datei öffnen
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-[#1e3a5f]">Abgeschlossene Checklisten</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Nur abgeschlossene Prüfungen können exportiert werden
          </p>
        </div>

        <div className="p-4">
          {runsLoading ? (
            <div className="flex h-24 items-center justify-center">
              <span className="text-sm text-slate-400">Lade Checklisten...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200">
              <p className="text-sm text-slate-400">
                Keine abgeschlossenen Checklisten vorhanden.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <ExportRunCard
                  key={run.id}
                  run={run}
                  selected={selectedRunId === run.id}
                  exporting={exportingId === run.id && isExporting}
                  wordLoading={exportingId === run.id && wordState.loading}
                  pdfLoading={exportingId === run.id && pdfState.loading}
                  onSelect={() =>
                    setSelectedRunId(run.id === selectedRunId ? null : run.id)
                  }
                  onExportWord={() => handleExportWord(run.id)}
                  onExportPdf={() => handleExportPdf(run.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-[#1e3a5f]">Export-Verlauf</h2>
        </div>
        <div className="p-4">
          {historyLoading ? (
            <div className="flex h-16 items-center justify-center">
              <span className="text-sm text-slate-400">Lade...</span>
            </div>
          ) : (
            <ExportHistoryTable
              records={exportHistory}
              onOeffnen={dateiOeffnen}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FolderIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
