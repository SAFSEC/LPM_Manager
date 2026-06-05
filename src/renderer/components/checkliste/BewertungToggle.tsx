import type { BewertungWert } from '@/types/checkliste';

interface BewertungToggleProps {
  value: BewertungWert | null;
  onChange: (value: BewertungWert) => void;
  disabled?: boolean;
}

const OPTIONEN: { value: BewertungWert; label: string; classes: string }[] = [
  { value: 'stabil', label: 'Stabil', classes: 'border-green-400 bg-green-50 text-green-800 ring-green-300' },
  { value: 'eingeschraenkt', label: 'Eingeschränkt', classes: 'border-yellow-400 bg-yellow-50 text-yellow-800 ring-yellow-300' },
  { value: 'instabil', label: 'Instabil', classes: 'border-red-400 bg-red-50 text-red-800 ring-red-300' },
  { value: 'na', label: 'N/A', classes: 'border-slate-300 bg-slate-50 text-slate-600 ring-slate-200' },
];

const INACTIVE = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';

export function BewertungToggle({ value, onChange, disabled = false }: BewertungToggleProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONEN.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-md border px-3 py-1.5 text-xs font-semibold transition-all',
              isActive ? `${opt.classes} ring-2` : INACTIVE,
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
