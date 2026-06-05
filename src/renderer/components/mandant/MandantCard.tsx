import { Link } from 'react-router-dom';
import type { Mandant } from '@/types/mandant';

interface MandantCardProps {
  mandant: Mandant;
  onSelect?: () => void;
}

export function MandantCard({ mandant, onSelect }: MandantCardProps): JSX.Element {
  const meta = [mandant.standort, mandant.branche].filter(Boolean).join(' · ');

  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        mandant.aktiv ? 'border-slate-200' : 'border-slate-200 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">{mandant.name}</h3>
          {meta ? <p className="mt-1 text-sm text-slate-600">{meta}</p> : null}
          {mandant.ansprechpartner ? (
            <p className="mt-1 text-sm text-slate-500">{mandant.ansprechpartner}</p>
          ) : null}
          {!mandant.aktiv ? (
            <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              Archiviert
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {mandant.aktiv ? (
          <>
            <Link
              to={`/mandant/${mandant.mandant_id}`}
              onClick={onSelect}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              Öffnen
            </Link>
            <button
              type="button"
              onClick={onSelect}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Als aktiv setzen
            </button>
          </>
        ) : (
          <span className="text-sm text-slate-500">Nur Ansicht</span>
        )}
      </div>
    </article>
  );
}
