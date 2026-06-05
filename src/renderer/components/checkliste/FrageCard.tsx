import { useState } from 'react';
import { BewertungToggle } from './BewertungToggle';
import type { ChecklisteFrage, BewertungWert, AntwortState } from '@/types/checkliste';
import { isFinding } from '@/types/checkliste';

interface FrageCardProps {
  frage: ChecklisteFrage;
  frageNummer: number;
  state: AntwortState;
  readonly: boolean;
  onBewertungChange: (frageId: string, bewertung: BewertungWert) => void;
  onKommentarChange: (frageId: string, kommentar: string) => void;
  onKommentarBlur: (frageId: string) => void;
}

export function FrageCard({
  frage,
  frageNummer,
  state,
  readonly,
  onBewertungChange,
  onKommentarChange,
  onKommentarBlur,
}: FrageCardProps): JSX.Element {
  const [showKommentar, setShowKommentar] = useState(
    Boolean(state.kommentar) || isFinding(state.bewertung)
  );

  const handleBewertung = (b: BewertungWert) => {
    onBewertungChange(frage.frageId, b);
    if (isFinding(b)) setShowKommentar(true);
  };

  const borderClass =
    state.bewertung === 'instabil'
      ? 'border-red-200 bg-red-50/30'
      : state.bewertung === 'eingeschraenkt'
        ? 'border-yellow-200 bg-yellow-50/20'
        : state.bewertung === 'stabil'
          ? 'border-green-100 bg-green-50/10'
          : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-lg border p-4 transition-colors ${borderClass}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {frageNummer}
        </span>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-slate-800 leading-snug">{frage.frageText}</p>

          <BewertungToggle value={state.bewertung} onChange={handleBewertung} disabled={readonly || state.saving} />

          {showKommentar || isFinding(state.bewertung) ? (
            <textarea
              rows={2}
              disabled={readonly}
              value={state.kommentar}
              onChange={(e) => onKommentarChange(frage.frageId, e.target.value)}
              onBlur={() => onKommentarBlur(frage.frageId)}
              placeholder={
                isFinding(state.bewertung)
                  ? 'Befund beschreiben (empfohlen)…'
                  : 'Kommentar…'
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
            />
          ) : (
            !readonly && (
              <button
                type="button"
                onClick={() => setShowKommentar(true)}
                className="text-xs text-slate-400 hover:text-primary"
              >
                + Kommentar hinzufügen
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
