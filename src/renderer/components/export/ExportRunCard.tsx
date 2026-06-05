interface ChecklisteRun {
  id: number;
  anlageId: string;
  anlageName: string;
  status: string;
  kiZusammenfassung: string | null;
  abgeschlossenAm: string | null;
  erstelltAm: string;
}

interface ExportRunCardProps {
  run: ChecklisteRun;
  selected: boolean;
  exporting: boolean;
  wordLoading: boolean;
  pdfLoading: boolean;
  onSelect: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
}

export function ExportRunCard({
  run,
  selected,
  exporting,
  wordLoading,
  pdfLoading,
  onSelect,
  onExportWord,
  onExportPdf,
}: ExportRunCardProps): JSX.Element {
  const abgeschlossenDatum = run.abgeschlossenAm
    ? new Date(run.abgeschlossenAm).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '–';

  return (
    <div
      className={`rounded-lg border transition-colors ${
        selected
          ? 'border-[#1e3a5f] bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button
        className="w-full px-4 py-3 text-left"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-12 items-center justify-center rounded bg-[#1e3a5f] text-xs font-bold text-white">
              {run.anlageId}
            </span>
            <div>
              <p className="font-medium text-slate-800 text-sm">{run.anlageName}</p>
              <p className="text-xs text-slate-400">Abgeschlossen: {abgeschlossenDatum}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {run.kiZusammenfassung && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                KI ✓
              </span>
            )}
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${selected ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {selected && (
        <div className="border-t border-blue-100 px-4 py-3">
          <p className="mb-3 text-xs text-slate-500">
            Wähle das Export-Format für diesen Bericht:
          </p>
          <div className="flex gap-3">
            <button
              onClick={onExportWord}
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162d4a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {wordLoading ? (
                <>
                  <SpinnerIcon />
                  Word wird erstellt...
                </>
              ) : (
                <>
                  <WordIcon />
                  Word (.docx) exportieren
                </>
              )}
            </button>
            <button
              onClick={onExportPdf}
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg border border-[#1e3a5f] px-4 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {pdfLoading ? (
                <>
                  <SpinnerIcon />
                  PDF wird erstellt...
                </>
              ) : (
                <>
                  <PdfIcon />
                  PDF exportieren
                </>
              )}
            </button>
          </div>
          {!run.kiZusammenfassung && (
            <p className="mt-2 text-xs text-amber-600">
              Hinweis: Keine KI-Zusammenfassung vorhanden. Der Export enthält diesen Abschnitt nicht.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function WordIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function PdfIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
