import type { FormularDefinition, FormularRow } from '@/types/formular';

interface FormularAuswahlProps {
  katalog: FormularDefinition[];
  gespeicherte: FormularRow[];
  onNeu: (definition: FormularDefinition) => void;
  onOeffnen: (row: FormularRow) => void;
  onLoeschen: (id: number) => void;
  loading: boolean;
}

const FORMULAR_ICONS: Record<string, string> = {
  'F-01': '📦',
  'F-02': '🔄',
  'F-03': '🔑',
  'F-04': '👤',
  'F-05': '🚨',
  'F-06': '🗝️',
  'F-07': '⚠️',
};

export function FormularAuswahl({
  katalog,
  gespeicherte,
  onNeu,
  onOeffnen,
  onLoeschen,
  loading,
}: FormularAuswahlProps): JSX.Element {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-[#1e3a5f]">Formulare</h2>
          <p className="mt-0.5 text-xs text-slate-400">7 LPM-Formulare – Formular auswählen und neu ausfüllen</p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {katalog.map((def) => (
            <FormularKarte key={def.formularId} definition={def} onNeu={onNeu} />
          ))}
        </div>
      </div>

      {(gespeicherte.length > 0 || loading) && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-[#1e3a5f]">Gespeicherte Formulare</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="flex h-16 items-center justify-center text-sm text-slate-400">
                Lade…
              </div>
            ) : (
              gespeicherte.map((row) => (
                <GespeichertesFormularZeile
                  key={row.id}
                  row={row}
                  onOeffnen={() => onOeffnen(row)}
                  onLoeschen={() => onLoeschen(row.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormularKarte({
  definition,
  onNeu,
}: {
  definition: FormularDefinition;
  onNeu: (d: FormularDefinition) => void;
}): JSX.Element {
  const icon = FORMULAR_ICONS[definition.formularId] ?? '📋';
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 hover:border-[#1e3a5f] hover:bg-blue-50 transition-colors">
      <div className="flex h-10 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f] text-sm font-bold text-white">
        {definition.formularId}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <p className="truncate font-semibold text-slate-800 text-sm">{definition.name}</p>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{definition.beschreibung}</p>
        <p className="mt-1.5 text-xs text-slate-400">{definition.felder.length} Felder</p>
      </div>
      <button
        onClick={() => onNeu(definition)}
        className="flex-shrink-0 rounded-lg bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#162d4a] transition-colors"
      >
        Neu
      </button>
    </div>
  );
}

function GespeichertesFormularZeile({
  row,
  onOeffnen,
  onLoeschen,
}: {
  row: FormularRow;
  onOeffnen: () => void;
  onLoeschen: () => void;
}): JSX.Element {
  const datum = new Date(row.geaendertAm).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
      <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded bg-[#1e3a5f] text-xs font-bold text-white">
        {row.formularId}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800 text-sm">{row.formularName}</p>
        <p className="text-xs text-slate-400">Zuletzt: {datum}</p>
      </div>
      <span
        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
          row.status === 'final'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}
      >
        {row.status === 'final' ? 'Final' : 'Entwurf'}
      </span>
      <button
        onClick={onOeffnen}
        className="flex-shrink-0 rounded-lg border border-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-[#1e3a5f] hover:bg-blue-50 transition-colors"
      >
        Öffnen
      </button>
      <button
        onClick={onLoeschen}
        className="flex-shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-red-200 hover:text-red-500 transition-colors"
        title="Formular löschen"
      >
        ✕
      </button>
    </div>
  );
}
