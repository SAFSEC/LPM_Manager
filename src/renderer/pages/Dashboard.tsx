import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMandant } from '@/context/MandantContext';
import { MandantCard } from '@/components/mandant/MandantCard';
import { emptyMandantFormValues, MandantForm } from '@/components/mandant/MandantForm';
import { formValuesToCreate } from '@/types/mandant';

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { mandanten, aktivMandanten, loading, setActiveMandantId, createMandant } = useMandant();
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const visible = showArchived ? mandanten : aktivMandanten;

  async function handleCreate(values: ReturnType<typeof emptyMandantFormValues>): Promise<void> {
    const created = await createMandant(formValuesToCreate(values));
    setShowCreate(false);
    navigate(`/mandant/${created.mandant_id}`);
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-500">
        Mandanten werden geladen…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Mandanten</h2>
          <p className="mt-1 text-sm text-slate-600">
            Kunden verwalten, auswählen und für Checklisten vorbereiten.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-accent/90"
        >
          + Neuer Mandant
        </button>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="rounded border-slate-300"
        />
        Archivierte Mandanten anzeigen
      </label>

      {showCreate ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Neuen Mandanten anlegen</h3>
          <MandantForm
            initialValues={emptyMandantFormValues()}
            submitLabel="Mandant anlegen"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </section>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Noch keine Mandanten vorhanden.</p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Ersten Mandanten anlegen
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((mandant) => (
            <MandantCard
              key={mandant.mandant_id}
              mandant={mandant}
              onSelect={() => setActiveMandantId(mandant.mandant_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
