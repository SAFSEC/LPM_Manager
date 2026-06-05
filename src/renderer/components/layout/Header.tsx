import { useNavigate } from 'react-router-dom';
import { useMandant } from '@/context/MandantContext';
import { AdapterBadge } from '@/components/ki/AdapterBadge';
import { useKiModus } from '@/hooks/useKiModus';

export function Header(): JSX.Element {
  const navigate = useNavigate();
  const { aktivMandanten, activeMandantId, setActiveMandantId, activeMandant } = useMandant();
  const { modus } = useKiModus();

  function handleSwitcherChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value;
    if (!value) {
      setActiveMandantId(null);
      return;
    }
    setActiveMandantId(value);
    navigate(`/mandant/${value}`);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">Aktiver Mandant</p>
        <p className="truncate text-base font-semibold text-slate-900">
          {activeMandant?.name ?? 'Kein Mandant ausgewählt'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <AdapterBadge modus={modus} />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="sr-only">Mandant wechseln</span>
          <select
            value={activeMandantId ?? ''}
            onChange={handleSwitcherChange}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Mandant wählen —</option>
            {aktivMandanten.map((mandant) => (
              <option key={mandant.mandant_id} value={mandant.mandant_id}>
                {mandant.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
