import type { FeldDefinition } from '@/types/formular';

interface FormularFeldProps {
  feld: FeldDefinition;
  wert: string;
  readOnly: boolean;
  onChange: (feldId: string, wert: string) => void;
}

export function FormularFeld({ feld, wert, readOnly, onChange }: FormularFeldProps): JSX.Element {
  const baseInput =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] transition-colors disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className={feld.breite === 'halb' ? '' : 'col-span-2'}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {feld.label}
        {feld.pflichtfeld && <span className="ml-1 text-red-500">*</span>}
      </label>

      {feld.typ === 'textarea' && (
        <textarea
          value={wert}
          onChange={(e) => onChange(feld.id, e.target.value)}
          disabled={readOnly}
          placeholder={feld.platzhalter}
          rows={3}
          className={`${baseInput} resize-y`}
        />
      )}

      {feld.typ === 'select' && (
        <select
          value={wert}
          onChange={(e) => onChange(feld.id, e.target.value)}
          disabled={readOnly}
          className={baseInput}
        >
          <option value="">– bitte wählen –</option>
          {feld.optionen?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {(feld.typ === 'text' || feld.typ === 'number') && (
        <input
          type={feld.typ}
          value={wert}
          onChange={(e) => onChange(feld.id, e.target.value)}
          disabled={readOnly}
          placeholder={feld.platzhalter}
          className={baseInput}
        />
      )}

      {feld.typ === 'date' && (
        <input
          type="date"
          value={wert}
          onChange={(e) => onChange(feld.id, e.target.value)}
          disabled={readOnly}
          className={baseInput}
        />
      )}

      {feld.typ === 'time' && (
        <input
          type="time"
          value={wert}
          onChange={(e) => onChange(feld.id, e.target.value)}
          disabled={readOnly}
          className={baseInput}
        />
      )}
    </div>
  );
}
