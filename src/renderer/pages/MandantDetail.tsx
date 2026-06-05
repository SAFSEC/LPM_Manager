import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMandant } from '@/context/MandantContext';
import { MandantForm } from '@/components/mandant/MandantForm';
import { formValuesToUpdate, mandantToFormValues } from '@/types/mandant';

export default function MandantDetail(): JSX.Element {
  const { mandantId } = useParams<{ mandantId: string }>();
  const navigate = useNavigate();
  const { mandanten, loading, setActiveMandantId, updateMandant, archivierenMandant } =
    useMandant();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const mandant = useMemo(
    () => mandanten.find((m) => m.mandant_id === mandantId),
    [mandanten, mandantId]
  );

  if (loading) {
    return <div className="text-slate-500">Mandant wird geladen…</div>;
  }

  if (!mandantId || !mandant) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Mandant nicht gefunden.</p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const id = mandantId;

  async function handleSave(values: ReturnType<typeof mandantToFormValues>): Promise<void> {
    await updateMandant(formValuesToUpdate(id, values));
    setActiveMandantId(id);
  }

  async function handleArchive(): Promise<void> {
    setArchiving(true);
    try {
      await archivierenMandant(id);
      navigate('/');
    } finally {
      setArchiving(false);
      setConfirmArchive(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Alle Mandanten
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{mandant.name}</h2>
          {!mandant.aktiv ? (
            <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              Archiviert – keine Bearbeitung möglich
            </span>
          ) : null}
        </div>
      </div>

      {mandant.aktiv ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Stammdaten bearbeiten</h3>
          <MandantForm
            key={mandant.geaendert_am}
            initialValues={mandantToFormValues(mandant)}
            submitLabel="Änderungen speichern"
            onSubmit={handleSave}
          />
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Standort" value={mandant.standort} />
            <DetailItem label="Ansprechpartner" value={mandant.ansprechpartner} />
            <DetailItem label="Branche" value={mandant.branche} />
            <DetailItem label="Notizen" value={mandant.notizen} full />
          </dl>
        </section>
      )}

      {mandant.aktiv ? (
        <section className="rounded-lg border border-red-100 bg-red-50/50 p-6">
          <h3 className="text-sm font-semibold text-red-900">Mandant archivieren</h3>
          <p className="mt-1 text-sm text-red-800">
            Der Mandant wird deaktiviert und erscheint nicht mehr in der aktiven Auswahl.
            Bestehende Daten bleiben erhalten.
          </p>
          {confirmArchive ? (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={archiving}
                onClick={() => void handleArchive()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {archiving ? 'Archiviere…' : 'Ja, archivieren'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmArchive(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmArchive(true)}
              className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
            >
              Mandant archivieren
            </button>
          )}
        </section>
      ) : null}

      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Checklisten, Formulare und Exporte für diesen Mandanten folgen in Phase 4–6.
      </section>
    </div>
  );
}

function DetailItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string | null;
  full?: boolean;
}): JSX.Element {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  );
}
