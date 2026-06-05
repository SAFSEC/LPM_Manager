import { AdapterBadge } from '@/components/ki/AdapterBadge';
import { useKiModus } from '@/hooks/useKiModus';
import { shortenPath, useSystemStatus } from '@/hooks/useSystemStatus';

const APP_VERSION = '1.0.0';

export function StatusBar(): JSX.Element {
  const { modus, loading: kiLoading } = useKiModus();
  const { dbPaths, loading: dbLoading, error } = useSystemStatus();

  const dbLabel =
    error ?? (dbPaths ? shortenPath(dbPaths.mainDb) : dbLoading ? 'Lade DB…' : '—');

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-slate-200 bg-slate-100 px-4 text-xs text-slate-600">
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-700">KI:</span>
        {kiLoading ? (
          <span>…</span>
        ) : (
          <AdapterBadge modus={modus} compact />
        )}
      </div>

      <div className="truncate px-4" title={dbPaths?.mainDb}>
        DB: {dbLabel}
      </div>

      <div>v{APP_VERSION}</div>
    </footer>
  );
}
