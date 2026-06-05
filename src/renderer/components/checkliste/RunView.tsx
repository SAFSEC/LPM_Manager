import { useMemo } from 'react';
import type { RunDetail, BewertungWert, AntwortState } from '@/types/checkliste';
import { isFinding } from '@/types/checkliste';
import { FrageCard } from './FrageCard';
import { ChecklisteProgress } from './ChecklisteProgress';
import { KiSummaryPanel } from '../ki/KiSummaryPanel';

interface RunViewProps {
  detail: RunDetail;
  antwortStates: Record<string, AntwortState>;
  kiStreamText: string;
  kiGenerating: boolean;
  onBewertungChange: (frageId: string, bewertung: BewertungWert) => void;
  onKommentarChange: (frageId: string, kommentar: string) => void;
  onKommentarBlur: (frageId: string) => void;
  onAbschliessen: () => void;
  onKiGenerate: () => void;
  abschliessenLoading: boolean;
  onBack: () => void;
}

export function RunView({
  detail,
  antwortStates,
  kiStreamText,
  kiGenerating,
  onBewertungChange,
  onKommentarChange,
  onKommentarBlur,
  onAbschliessen,
  onKiGenerate,
  abschliessenLoading,
  onBack,
}: RunViewProps): JSX.Element {
  const { run, anlage } = detail;
  const readonly = run.status === 'abgeschlossen';

  const { beantwortet, findings } = useMemo(() => {
    let b = 0;
    let f = 0;
    for (const s of Object.values(antwortStates)) {
      if (s.bewertung) b++;
      if (isFinding(s.bewertung)) f++;
    }
    return { beantwortet: b, findings: f };
  }, [antwortStates]);

  const abschnitte = useMemo(() => {
    const map = new Map<string, typeof anlage.fragen>();
    for (const frage of anlage.fragen) {
      if (!map.has(frage.abschnitt)) map.set(frage.abschnitt, []);
      map.get(frage.abschnitt)!.push(frage);
    }
    return map;
  }, [anlage.fragen]);

  let frageNummer = 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="text-sm text-primary hover:underline">
            ← Anlage wechseln
          </button>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {anlage.anlageId} – {anlage.name}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{anlage.beschreibung}</p>
        </div>
        <div className="flex items-center gap-2">
          {readonly ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Abgeschlossen
            </span>
          ) : (
            <button
              type="button"
              disabled={abschliessenLoading || beantwortet === 0}
              onClick={onAbschliessen}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-accent/90 disabled:opacity-50"
            >
              {abschliessenLoading ? 'Wird abgeschlossen…' : 'Prüfung abschließen'}
            </button>
          )}
        </div>
      </div>

      <ChecklisteProgress beantwortet={beantwortet} gesamt={anlage.fragen.length} findings={findings} />

      {Array.from(abschnitte.entries()).map(([abschnitt, fragen]) => {
        const abschnittBeantwortet = fragen.filter((f) => antwortStates[f.frageId]?.bewertung).length;
        return (
          <section key={abschnitt} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-slate-700">{abschnitt}</h3>
              <span className="text-xs text-slate-400">
                {abschnittBeantwortet} / {fragen.length}
              </span>
            </div>
            {fragen.map((frage) => {
              frageNummer++;
              const state = antwortStates[frage.frageId] ?? {
                bewertung: null,
                kommentar: '',
                saving: false,
              };
              return (
                <FrageCard
                  key={frage.frageId}
                  frage={frage}
                  frageNummer={frageNummer}
                  state={state}
                  readonly={readonly}
                  onBewertungChange={onBewertungChange}
                  onKommentarChange={onKommentarChange}
                  onKommentarBlur={onKommentarBlur}
                />
              );
            })}
          </section>
        );
      })}

      {readonly && (
        <KiSummaryPanel
          zusammenfassung={run.kiZusammenfassung}
          streamText={kiStreamText}
          generating={kiGenerating}
          kiAdapter={run.kiAdapter}
          onGenerate={onKiGenerate}
        />
      )}
    </div>
  );
}
