import { useState, type FormEvent } from 'react';
import type { MandantFormValues } from '@/types/mandant';

interface MandantFormProps {
  initialValues: MandantFormValues;
  submitLabel: string;
  onSubmit: (values: MandantFormValues) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: MandantFormValues = {
  name: '',
  standort: '',
  ansprechpartner: '',
  branche: '',
  notizen: '',
};

export function emptyMandantFormValues(): MandantFormValues {
  return { ...emptyValues };
}

function Field({
  id,
  label,
  value,
  onChange,
  required = false,
  multiline = false,
}: {
  id: keyof MandantFormValues;
  label: string;
  value: string;
  onChange: (id: keyof MandantFormValues, value: string) => void;
  required?: boolean;
  multiline?: boolean;
}): JSX.Element {
  const common =
    'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? ' *' : ''}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={common}
        />
      ) : (
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={common}
        />
      )}
    </div>
  );
}

export function MandantForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: MandantFormProps): JSX.Element {
  const [values, setValues] = useState<MandantFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(id: keyof MandantFormValues, value: string): void {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('Bitte einen Mandantennamen eingeben.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Field id="name" label="Name" value={values.name} onChange={updateField} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="standort" label="Standort" value={values.standort} onChange={updateField} />
        <Field
          id="ansprechpartner"
          label="Ansprechpartner"
          value={values.ansprechpartner}
          onChange={updateField}
        />
      </div>
      <Field id="branche" label="Branche" value={values.branche} onChange={updateField} />
      <Field
        id="notizen"
        label="Notizen"
        value={values.notizen}
        onChange={updateField}
        multiline
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Speichern…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Abbrechen
          </button>
        ) : null}
      </div>
    </form>
  );
}
