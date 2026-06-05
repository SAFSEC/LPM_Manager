import type { FormularDefinition, FormularRow } from '@/types/formular';
import { FormularFeld } from './FormularFeld';

interface FormularFormViewProps {
  definition: FormularDefinition;
  currentRow: FormularRow | null;
  felder: Record<string, string>;
  finalisiereLoading: boolean;
  exportWordLoading: boolean;
  exportPdfLoading: boolean;
  letzterExport: { dateiname: string; dateipfad: string } | null;
  error: string | null;
  onFeldChange: (feldId: string, wert: string) => void;
  onFinalisieren: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  onDateiOeffnen: (pfad: string) => void;
  onBack: () => void;
}

export function FormularFormView({
  definition,
  currentRow,
  felder,
  finalisiereLoading,
  exportWordLoading,
  exportPdfLoading,
  letzterExport,
  error,
  onFeldChange,
  onFinalisieren,
  onExportWord,
  onExportPdf,
  onDateiOeffnen,
  onBack,
}: FormularFormViewProps): JSX.Element {
  const isFinal = currentRow?.status === 'final';
  const isExporting = exportWordLoading || exportPdfLoading;

  const gruppenMap = new Map<string, typeof definition.felder>();
  for (const feld of definition.felder) {
    const gruppe = feld.gruppe ?? 'Allgemein';
    if (!gruppenMap.has(gruppe)) gruppenMap.set(gruppe, []);
    gruppenMap.get(gruppe)!.push(feld);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeftIcon />
          Zurück
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#1e3a5f] px-2 py-0.5 text-xs font-bold text-white">
              {definition.formularId}
            </span>
            <h1 className="truncate text-xl font-bold text-[#1e3a5f]">{definition.name}</h1>
            {isFinal && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Final
              </span>
            )}
            {currentRow && !isFinal && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Entwurf – Auto-Speichern aktiv
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {letzterExport && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">Export erfolgreich erstellt</p>
              <p className="mt-0.5 text-xs text-green-600">{letzterExport.dateiname}</p>
            </div>
            <button
              onClick={() => onDateiOeffnen(letzterExport.dateipfad)}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              Datei öffnen
            </button>
          </div>
        </div>
      )}

      {Array.from(gruppenMap.entries()).map(([gruppenName, gruppenFelder]) => (
        <div key={gruppenName} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-3">
            <h2 className="text-sm font-semibold text-[#1e3a5f]">{gruppenName}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            {gruppenFelder.map((feld) => (
              <FormularFeld
                key={feld.id}
                feld={feld}
                wert={felder[feld.id] ?? ''}
                readOnly={isFinal}
                onChange={onFeldChange}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {!isFinal && (
            <button
              onClick={onFinalisieren}
              disabled={finalisiereLoading}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {finalisiereLoading ? <SpinnerIcon /> : <CheckIcon />}
              Als Final markieren
            </button>
          )}
          <button
            onClick={onExportWord}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162d4a] disabled:opacity-60 transition-colors"
          >
            {exportWordLoading ? <SpinnerIcon /> : <WordIcon />}
            Word exportieren
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-[#1e3a5f] px-4 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-blue-50 disabled:opacity-60 transition-colors"
          >
            {exportPdfLoading ? <SpinnerIcon /> : <PdfIcon />}
            PDF exportieren
          </button>
        </div>
        {isFinal && (
          <p className="mt-2 text-xs text-slate-400">
            Das Formular ist als final markiert und kann nicht mehr bearbeitet werden.
          </p>
        )}
      </div>
    </div>
  );
}

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
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
