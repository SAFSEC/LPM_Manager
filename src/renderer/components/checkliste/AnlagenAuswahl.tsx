import type { AnlageMeta } from '@/types/checkliste';

interface AnlagenAuswahlProps {
  anlagen: AnlageMeta[];
  laufendeRunIds: Record<string, number>;
  onStart: (anlageId: string) => void;
  onWeiter: (runId: number) => void;
}

export function AnlagenAuswahl({
  anlagen,
  laufendeRunIds,
  onStart,
  onWeiter,
}: AnlagenAuswahlProps): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {anlagen.map((a) => {
        const laufenderRunId = laufendeRunIds[a.anlageId];
        return (
          <div
            key={a.anlageId}
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {a.anlageId}
              </span>
              <span className="text-xs text-slate-400">{a.anzahlFragen} Fragen</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-800 leading-snug">{a.name}</h3>
            <p className="mt-1 flex-1 text-xs text-slate-500 line-clamp-2">{a.beschreibung}</p>
            <div className="mt-3">
              {laufenderRunId ? (
                <button
                  type="button"
                  onClick={() => onWeiter(laufenderRunId)}
                  className="w-full rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                >
                  Weiter bearbeiten
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStart(a.anlageId)}
                  className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  Neue Prüfung starten
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
