interface KiErklaerPanelProps {
  titel?: string;
  loading: boolean;
  text: string;
  tiefe: 'kurz' | 'ausfuehrlich';
  error: string | null;
  onErklaeren: (tiefe: 'kurz' | 'ausfuehrlich') => void;
  onZuruecksetzen: () => void;
}

export function KiErklaerPanel({
  titel: _titel,
  loading,
  text,
  tiefe,
  error,
  onErklaeren,
  onZuruecksetzen,
}: KiErklaerPanelProps): JSX.Element {
  const hatInhalt = text.length > 0;

  return (
    <div className="rounded-lg border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#1e3a5f]">KI-Erklärung</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading
              ? `Ollama erklärt (${tiefe === 'kurz' ? 'Kurzfassung' : 'Ausführlich'})…`
              : 'Lass diesen Abschnitt von Ollama lokal erklären.'}
          </p>
        </div>

        {!hatInhalt && !loading && (
          <div className="flex gap-2">
            <button
              onClick={() => onErklaeren('kurz')}
              className="rounded-lg bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#162d4a] transition-colors"
            >
              Kurz erklären
            </button>
            <button
              onClick={() => onErklaeren('ausfuehrlich')}
              className="rounded-lg border border-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-[#1e3a5f] hover:bg-blue-50 transition-colors"
            >
              Ausführlich
            </button>
          </div>
        )}

        {(hatInhalt || loading) && !loading && (
          <button
            onClick={onZuruecksetzen}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
          {error}
        </p>
      )}

      {(hatInhalt || loading) && (
        <div className="rounded-md bg-white p-4 text-sm text-slate-800 shadow-sm ring-1 ring-slate-100 leading-relaxed whitespace-pre-wrap">
          {text}
          {loading && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#1e3a5f] align-middle" />
          )}
        </div>
      )}

      {!hatInhalt && !loading && !error && (
        <p className="text-xs text-slate-400 italic">
          Klicke auf &quot;Kurz erklären&quot; oder &quot;Ausführlich&quot;, um diesen Abschnitt mit Ollama (lokal) zu erklären.
        </p>
      )}
    </div>
  );
}
