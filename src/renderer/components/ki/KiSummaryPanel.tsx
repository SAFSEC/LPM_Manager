interface KiSummaryPanelProps {
  zusammenfassung: string | null;
  streamText: string;
  generating: boolean;
  kiAdapter: string | null;
  onGenerate: () => void;
}

export function KiSummaryPanel({
  zusammenfassung,
  streamText,
  generating,
  kiAdapter,
  onGenerate,
}: KiSummaryPanelProps): JSX.Element {
  const displayText = generating ? streamText : (zusammenfassung ?? streamText);
  const adapterLabel = kiAdapter
    ? kiAdapter.charAt(0).toUpperCase() + kiAdapter.slice(1)
    : 'Ollama (lokal)';

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-primary">KI-Zusammenfassung</h3>
          {(kiAdapter || generating) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {generating ? 'Wird generiert mit Ollama…' : `Erstellt mit ${adapterLabel}`}
            </p>
          )}
        </div>
        {!zusammenfassung && !generating && (
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            KI-Zusammenfassung erstellen
          </button>
        )}
      </div>

      {displayText ? (
        <div className="whitespace-pre-wrap rounded-md bg-white p-4 text-sm text-slate-800 shadow-sm ring-1 ring-slate-100 leading-relaxed">
          {displayText}
          {generating && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
          )}
        </div>
      ) : (
        !generating && (
          <p className="text-sm text-slate-500 italic">
            Noch keine KI-Zusammenfassung vorhanden.
          </p>
        )
      )}
    </div>
  );
}
